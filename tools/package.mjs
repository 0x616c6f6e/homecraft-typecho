/** Dependency-free deterministic release builder. Run with Node 22+ via dev/package.sh. */
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {deflateRawSync} from 'node:zlib';
const args=process.argv.slice(2);
const option=name=>{const i=args.indexOf(name);return i<0?null:args[i+1];};
const source=path.resolve(option('--theme-dir')||new URL('../theme/',import.meta.url).pathname);
const output=path.resolve(option('--output')||'dist');
const retain=option('--retain');
const hash=data=>crypto.createHash('sha256').update(data).digest('hex');
const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).sort((a,b)=>a.name.localeCompare(b.name,'en')).flatMap(e=>{
  if(e.isSymbolicLink())throw Error('Symlinks are not allowed in packages: '+e.name);
  return e.isDirectory()?walk(path.join(dir,e.name)):e.isFile()?[path.join(dir,e.name)]:[];
});
const version=fs.readFileSync(path.join(source,'index.php'),'utf8').match(/@version\s+([0-9A-Za-z.-]+)/)?.[1];
if(!version)throw Error('Missing theme version');
const assets=new Map();
for(const file of walk(source)) {
  const rel=path.relative(source,file);
  if(rel.split(path.sep).some(p=>['.git','node_modules','work'].includes(p)) || /(^|[\/])\.env|\.(pem|key|sql|log)$/i.test(rel) || rel.includes('config.inc.php')) throw Error('Unexpected private/runtime input: '+rel);
}
const inventory=JSON.parse(fs.readFileSync(new URL('../docs/UPSTREAM-FILES.json',import.meta.url),'utf8'));
const patches=JSON.parse(fs.readFileSync(new URL('../docs/UPSTREAM-PATCHES.json',import.meta.url),'utf8'));
if(patches.revision!==inventory.revision)throw Error('Upstream patch revision mismatch');
for(const [file,patch] of Object.entries(patches.files)) {
  if(!inventory.files[file] || inventory.files[file]!==patch.upstreamSha256 || !/^[a-f0-9]{64}$/.test(patch.localSha256))throw Error('Invalid upstream patch record: '+file);
}
for(const [file,digest] of Object.entries(inventory.files))if(hash(fs.readFileSync(path.join(source,file)))!==(patches.files[file]?.localSha256||digest))throw Error('Upstream inventory mismatch: '+file);
for(const dir of ['js','css','engine','world','vendor','assets']) {
  for(const file of walk(path.join(source,dir)))assets.set(path.relative(source,file).split(path.sep).join('/'),fs.readFileSync(file));
}
assets.set('.htaccess',Buffer.from('<IfModule mod_headers.c>\nHeader set Cache-Control "public, max-age=31536000, immutable"\n</IfModule>\n'));
const entries=[...assets].sort(([a],[b])=>a<b?-1:a>b?1:0);
const hashes=Object.fromEntries(entries.map(([name,data])=>[name,hash(data)]));
const assetId=hash(JSON.stringify(hashes));
const files=new Map(entries.map(([name,data])=>[`static/${assetId}/${name}`,data]));
for(const file of ['404.php','archive.php','footer.php','functions.php','header.php','index.php','page.php','post.php','scene.php','LICENSE'])files.set(file,fs.readFileSync(path.join(source,file)));
for(const dir of ['inc','partials'])for(const file of walk(path.join(source,dir))) {
  if(!file.endsWith('.php'))throw Error('Unexpected adapter file: '+file);
  files.set(path.relative(source,file).split(path.sep).join('/'),fs.readFileSync(file));
}
// Retain every previous immutable graph so open tabs survive an upgrade/rollback.
if(retain) {
  const previous=path.resolve(retain);
  const prior=JSON.parse(fs.readFileSync(path.join(previous,'release.json'),'utf8'));
  for(const [name,digest] of Object.entries(prior.files)) {
    if(!/^static\/[a-f0-9]{64}\/[A-Za-z0-9_./-]+$/.test(name)||name.split('/').includes('..'))throw Error('Unsafe retained asset path');
    const data=fs.readFileSync(path.join(previous,name));
    if(hash(data)!==digest)throw Error('Retained file checksum mismatch: '+name);
    if(files.has(name)&&!files.get(name).equals(data))throw Error('Immutable asset collision');
    files.set(name,data);
  }
}
const root=new URL('../',import.meta.url).pathname;
for(const name of ['UPSTREAM.md','UPSTREAM-FILES.json','UPSTREAM-PATCHES.json','SETTINGS.md','READING-COMMENTS.md','INSTALLATION.md','BUILDINGS.md','SHOW-HOME.md','SHOW-HOME-FILES.json','SCENE-BROWSER.md'])files.set('docs/'+name,fs.readFileSync(path.join(root,'docs',name)));
const manifest={version,assetId,files:Object.fromEntries([...files].filter(([n])=>n.startsWith('static/')).sort().map(([n,d])=>[n,hash(d)]))};
files.set('release.json',Buffer.from(JSON.stringify(manifest,null,2)+'\n'));
// ZIP: fixed DOS epoch, stable order, UTF-8 paths, Unix 0644 files, no host metadata.
const crc32=data=>{let c=0xffffffff;for(const b of data){c^=b;for(let i=0;i<8;i++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;};
const local=[],central=[];let offset=0;
for(const [relative,data] of [...files].sort(([a],[b])=>a<b?-1:a>b?1:0)) {
  const name=Buffer.from('homecraft-typecho/'+relative),compressed=deflateRawSync(data,{level:9}),crc=crc32(data);
  const h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(8,8);h.writeUInt16LE(33,12);h.writeUInt32LE(crc,14);h.writeUInt32LE(compressed.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);
  local.push(h,name,compressed);
  const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(0x314,4);h.copy(c,6,4,30);c.writeUInt32LE((0o100644<<16)>>>0,38);c.writeUInt32LE(offset,42);central.push(c,name);
  offset+=h.length+name.length+compressed.length;
}
const dir=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.size,8);end.writeUInt16LE(files.size,10);end.writeUInt32LE(dir.length,12);end.writeUInt32LE(offset,16);
fs.mkdirSync(output,{recursive:true});
const archive=path.join(output,`homecraft-typecho-${version}.zip`);
const data=Buffer.concat([...local,dir,end]);fs.writeFileSync(archive,data);fs.writeFileSync(archive+'.sha256',hash(data)+'  '+path.basename(archive)+'\n');
console.log(JSON.stringify({archive,version,assetId,files:files.size,bytes:data.length,sha256:hash(data)}));
