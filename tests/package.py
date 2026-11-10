"""Exercise the actual pinned builder, ZIP integrity, retention and reproducibility."""
from pathlib import Path
import hashlib, json, shutil, subprocess, zipfile
root = Path(__file__).resolve().parents[1]
work = root / 'work/release-test'
work.mkdir(parents=True, exist_ok=True)
checks = []
def build(*args, ok=True):
    result = subprocess.run(['./dev/package.sh', *args], cwd=root, capture_output=True, text=True)
    if ok:
        assert result.returncode == 0, result.stderr
        return json.loads(result.stdout.strip().splitlines()[-1])
    assert result.returncode != 0, 'Unsafe build input was accepted'
def unpack(info, slot):
    archive = root / 'dist' / Path(info['archive']).name
    target = work / 'releases' / slot
    if target.exists(): shutil.rmtree(target)
    with zipfile.ZipFile(archive) as z:
        assert z.testzip() is None
        names = z.namelist()
        assert len(names) == len(set(names))
        assert all(n.startswith('homecraft-typecho/') and '..' not in Path(n).parts for n in names)
        assert not any(any(p in n.split('/') for p in ['work','dev','tests','.git','node_modules']) or n.endswith(('.pem','.key','.sql','.log')) for n in names)
        assert 'homecraft-typecho/LICENSE' in names
        assert any(n.endswith('/vendor/three/LICENSE') for n in names)
        assert all(i.date_time == (1980,1,1,0,0,0) for i in z.infolist())
        z.extractall(target)
    theme = target / 'homecraft-typecho'
    release = json.loads((theme/'release.json').read_text())
    for name, digest in release['files'].items():
        assert hashlib.sha256((theme/name).read_bytes()).hexdigest() == digest
    inventory=json.loads((root/'docs/UPSTREAM-FILES.json').read_text())['files']
    patches=json.loads((theme/'docs/UPSTREAM-PATCHES.json').read_text())['files']
    assert json.loads((theme/'docs/UPSTREAM-FILES.json').read_text())['files']==inventory
    for name,digest in inventory.items():
        file=theme/'LICENSE' if name=='LICENSE' else theme/'static'/release['assetId']/name
        if name in patches:
            assert patches[name]['upstreamSha256']==digest
            digest=patches[name]['localSha256']
        assert hashlib.sha256(file.read_bytes()).hexdigest()==digest
    return theme, release
first=build()
original=(root/'dist'/Path(first['archive']).name).read_bytes()
second=build()
assert first['sha256']==second['sha256'] and original==(root/'dist'/Path(second['archive']).name).read_bytes()
a,ra=unpack(first,'A')
checks.append('identical source produces byte-identical ZIP; CRC, paths, licenses and upstream hashes verified')
source=work/'source-b'
if source.exists(): shutil.rmtree(source)
shutil.copytree(root/'theme',source)
(source/'js/reading-content.js').write_text((source/'js/reading-content.js').read_text()+'\n// Synthetic upgrade cache marker.\n')
(source/'index.php').write_text((source/'index.php').read_text().replace(first['version'],first['version']+'-upgrade-test'))
binfo=build('--theme-dir','/repo/work/release-test/source-b','--retain','/repo/work/release-test/releases/A/homecraft-typecho')
b,rb=unpack(binfo,'B')
assert ra['assetId']!=rb['assetId']
assert (b/'static'/ra['assetId']/'js/app.js').read_bytes()==(a/'static'/ra['assetId']/'js/app.js').read_bytes()
checks.append('changed JavaScript receives a new whole-graph ID while previous immutable files are retained')
rollback=build('--retain','/repo/work/release-test/releases/B/homecraft-typecho')
r,rr=unpack(rollback,'rollback')
assert rr['assetId']==ra['assetId'] and (r/'static'/rb['assetId']/'js/app.js').is_file()
checks.append('rollback selects the original graph while retaining the upgraded graph for open tabs')
# Actual negative build: protect upstream integrity and reject private inputs.
(source/'engine/main.js').write_text('invalid upstream edit')
build('--theme-dir','/repo/work/release-test/source-b',ok=False)
(source/'engine/main.js').write_bytes((root/'theme/engine/main.js').read_bytes())
(source/'engine/world/player.js').write_text('invalid edit to recorded patch')
build('--theme-dir','/repo/work/release-test/source-b',ok=False)
(source/'engine/world/player.js').write_bytes((root/'theme/engine/world/player.js').read_bytes())
(source/'assets/.env').write_text('SYNTHETIC_NOT_A_SECRET=1\n')
build('--theme-dir','/repo/work/release-test/source-b',ok=False)
(source/'assets/.env').unlink()
checks.append('builder rejects modified upstream runtime, modified recorded patch and accidental private configuration')
# Restore the distributable to a fresh single-graph build after fixture packaging.
build()
active=work/'active'
if active.is_symlink(): active.unlink()
assert not active.exists(), 'Refusing to replace a non-symlink active directory'
active.symlink_to('releases/A/homecraft-typecho')
(work/'package-report.json').write_text(json.dumps({'checks':checks,'a':ra['assetId'],'b':rb['assetId'],'archive':first},indent=2))
print(json.dumps({'checks':checks,'archive':first},indent=2))
