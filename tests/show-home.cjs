const {chromium}=require('playwright');const assert=require('node:assert/strict');const fs=require('node:fs');
(async()=>{
const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={scope:'Source show-home architecture and real F-key interactions',checks:[]};
try{for(const [name,base,width]of[['desktop','http://127.0.0.1:18094/',1280],['mobile-sized','http://127.0.0.1:18095/journal/',390]]){
 const c=await browser.newContext({viewport:{width,height:844}});const p=await c.newPage();const errors=[],http=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)http.push([r.status(),r.url()]);});
 await p.goto(base);await p.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:90000});assert.equal(await p.evaluate(()=>window.__homeStartupError||null),null);await p.locator('#loading').waitFor({state:'detached',timeout:20000});
 await p.evaluate(()=>window.__home.go('about'));await p.keyboard.press('Escape');
 const stations=await p.evaluate(async()=>{const l=await import('@world/layout.js');return l.STATIONS.filter(s=>['blog','about','court','lab','coffee','pool','writing','mountain','portal'].includes(s.id));});
 for(const s of stations){
  await p.evaluate(s=>{window.__home.teleport(...s.at);},s);
  await p.waitForFunction(id=>{const q=document.querySelector('#prompt');return q&&!q.hidden&&q.querySelector('span').textContent.length>0;},s.id,{timeout:15000});
  await p.keyboard.press('f');
  await p.waitForFunction(id=>document.querySelector('#panel')?.open&&document.querySelector('#panel').dataset.station===id,s.id,{timeout:15000});
  if(s.id==='blog')assert.ok(await p.locator('#panel [data-recent-posts] li').count()>0);
  if(s.id==='blog'){
   await p.keyboard.press('f');assert.equal(await p.locator('#panel').evaluate(e=>e.open),true); // Native modal guard prevents world shortcuts while reading.
  }
  console.log('PASS '+name+' F: '+s.id);
  await p.keyboard.press('Escape');await p.waitForFunction(()=>!document.querySelector('#panel').open);
 }
 const result=await p.evaluate(()=>({stats:window.__home.stats(),pool:!!window.__home.world.surfaces,outer:!!window.__home.world.outer,mountain:!!window.__home.world.mountain,roofAccess:!!window.__home.world.roofAccess,hotspots:window.__home.world.hotspots.map(h=>h.id)}));
 assert.ok(result.outer&&result.mountain&&result.roofAccess);assert.ok(result.hotspots.includes('blog'));
 await p.evaluate(()=>window.__home.go('about'));await p.keyboard.press('Escape');
 await p.waitForTimeout(1500);
 await p.screenshot({path:`/results/show-home-${name}.png`});
 await p.evaluate(()=>{window.__home.teleport(.5,21);window.__home.rig.showcase([52,40,66],[0,0,2]);});
 await p.waitForTimeout(2500);await p.screenshot({path:`/results/show-home-${name}-overview.png`});
 assert.deepEqual(errors,[]);assert.deepEqual(http,[]);report.checks.push({name,passed:true,stations:stations.map(s=>s.id),...result});console.log('PASS '+name);await c.close();
}}catch(e){report.error=String(e.stack);process.exitCode=1;}finally{await browser.close();fs.writeFileSync('/results/show-home.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
