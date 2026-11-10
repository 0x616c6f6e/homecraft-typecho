const {chromium} = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const baseline = process.argv.includes('--baseline');
  const browser = await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report = {scope:'Pool exits with real show-home navigation and native player/input',baseline,checks:[]};
  try {
    const views = baseline ? [['baseline','http://127.0.0.1:18094/',1000]] : [
      ['desktop','http://127.0.0.1:18094/',1280],
      ['mobile-sized-subdirectory','http://127.0.0.1:18095/journal/',390],
    ];
    for (const [name,base,width] of views) {
      const context = await browser.newContext({viewport:{width,height:844}});
      const page = await context.newPage();
      const errors = [], http = [];
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{if(r.status()>=400)http.push({status:r.status(),path:new URL(r.url()).pathname});});
      if (baseline) await page.route('**/engine/world/player.js',async route=>{
        const response = await route.fetch();
        const source = await response.text();
        assert.ok(source.includes('z: POOL.z0 - 1.2'));
        await route.fulfill({response,body:source.replace('z: POOL.z0 - 1.2','z: POOL.z0 - 0.9')});
      });
      await page.goto(base+'?debug');
      await page.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:90000});
      assert.equal(await page.evaluate(()=>window.__homeStartupError||null),null);
      await page.locator('#loading').waitFor({state:'detached'});
      const results = await page.evaluate(async baseline=>{
        const {urls,scene} = JSON.parse(document.querySelector('#homecraft-bootstrap').textContent);
        if(scene.preset!=='show-home') throw Error('This regression needs the show-home preset');
        const {createPlayer} = await import(new URL('engine/world/player.js',urls.assetBase));
        const {createInput} = await import(new URL('engine/input.js',urls.assetBase));
        const THREE = await import('three');
        const h = window.__home, neutral = {x:0,z:0,run:false,up:false,down:false};
        const tick = (p,input=neutral,n=1200,stop=()=>false) => {
          for(let i=0;i<n&&!stop();i++) p.update(1/60,input,0);
        };
        const seed = (x,z=26) => {
          const avatar = {root:new THREE.Group(),blob:{position:new THREE.Vector3(),material:{opacity:1}},update(){}};
          const p = createPlayer({avatar,nav:h.nav,grid:h.world.grid,ground:h.world.ground});
          if(!p.teleport(x,22)||!p.enterPool(x,z)) throw Error('Could not enter pool');
          tick(p);
          if(!p.swimming) throw Error('Entry did not reach swimming');
          return p;
        };
        const exits = baseline ? [['ladder',.725,0,-1]] : [
          ['north coping',-5,0,-1],['ladder left approach',0,0,-1],
          ['ladder centre',.725,0,-1],['ladder right approach',1.4,0,-1],
          ['west coping',-11,-1,0],['east coping',1,1,0],
        ];
        const checks = [];
        for(const [label,x,dx,dz] of exits) {
          const p = seed(x);
          tick(p,{...neutral,x:dx,z:dz},1200,()=>p.mode==='ground');
          const landed = {x:p.pos.x,z:p.pos.z,y:p.y,mode:p.mode};
          const canStand = h.nav.canStand(p.pos.x,p.pos.z);
          const before = {x:p.pos.x,z:p.pos.z};
          if(p.mode==='ground') tick(p,{...neutral,z:-1},60);
          const walkedAway=Math.hypot(p.pos.x-before.x,p.pos.z-before.z)>.5;
          let workaround;
          if(baseline) {
            tick(p,{...neutral,x:-1},180);
            tick(p,{...neutral,z:-1},1200,()=>p.mode==='ground');
            workaround={mode:p.mode,canStand:h.nav.canStand(p.pos.x,p.pos.z)};
          }
          checks.push({label,landed,canStand,walkedAway,...(workaround?{workaround}:{})});
        }
        if(baseline) return checks;
        for(const deep of [false,true]) {
          const p=seed(.725);
          if(deep) {p.toggleDive();tick(p,neutral,600);}
          const accepted=p.leavePool(.725,22);
          tick(p,neutral,1800,()=>p.mode==='ground');
          checks.push({label:deep?'click-to-deck from pool bed':'click-to-deck at surface',accepted,mode:p.mode,canStand:h.nav.canStand(p.pos.x,p.pos.z)});
        }
        const sea=seed(-5);
        tick(sea,{...neutral,z:1},600);
        const stayedInPool=sea.swimming&&sea.pos.z<=30;
        tick(sea,{...neutral,z:-1},1200,()=>sea.mode==='ground');
        checks.push({label:'sea edge blocks exit and allows retreat',stayedInPool,mode:sea.mode});
        window.__poolKeyboard={p:seed(.725),input:createInput(document.createElement('canvas'),{})};
        return checks;
      },baseline);
      if(baseline) {
        assert.equal(results[0].landed.mode,'swim');
        assert.equal(results[0].canStand,false);
        assert.equal(results[0].workaround.mode,'ground');assert.ok(results[0].workaround.canStand);
        report.checks.push({name,expectedOriginalFailure:true,results});
      } else {
        for(const r of results) {
          if(r.landed) {assert.equal(r.landed.mode,'ground',r.label);assert.ok(r.canStand&&r.walkedAway,r.label);}
          else {assert.equal(r.mode,'ground',r.label);assert.ok(r.accepted??r.stayedInPool,r.label);if('canStand' in r)assert.ok(r.canStand,r.label);}
        }
        await page.keyboard.down('w');
        const keyboard = await page.evaluate(()=>{
          const {p,input}=window.__poolKeyboard;
          for(let i=0;i<1200&&p.mode!=='ground';i++)p.update(1/60,input.read(),0);
          return {mode:p.mode,inputZ:input.read().z,canStand:window.__home.nav.canStand(p.pos.x,p.pos.z)};
        });
        await page.keyboard.up('w');
        assert.equal(keyboard.inputZ,-1); assert.equal(keyboard.mode,'ground'); assert.ok(keyboard.canStand);
        // Render the real avatar after a native ladder climb, not just a physics fixture.
        await page.evaluate(()=>{
          const h=window.__home,p=h.player,empty={x:0,z:0,run:false,up:false,down:false};
          h.teleport(.725,22);p.enterPool(.725,26);
          for(let i=0;i<1200;i++)p.update(1/60,empty,0);
          for(let i=0;i<1200&&p.mode!=='ground';i++)p.update(1/60,{...empty,z:-1},0);
          h.rig.set(0,.45,8);h.rig.recenter(p);
          for(let i=0;i<180;i++)h.rig.update(1/60,p);
          h.stage.render();
        });
        // Software WebGL may need several frames to present the new camera.
        await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>requestAnimationFrame(resolve)))));
        assert.equal(await page.evaluate(()=>window.__home.player.mode),'ground');
        await page.screenshot({path:`/results/pool-${name}.png`});
        const stats=await page.evaluate(()=>window.__home.stats());
        // Record the source house's cost at this newly tested camera angle.
        // The landing fix changes neither geometry nor rendering settings.
        const budget={calls:stats.calls<=60,triangles:stats.triangles<=200000,lights:stats.lights<=2};
        assert.deepEqual(errors,[]);assert.deepEqual(http,[]);
        report.checks.push({name,passed:true,results,keyboard,stats,budget});
      }
      console.log('PASS '+name);
      await context.close();
    }
  } catch(e) {report.error=String(e.stack);process.exitCode=1;}
  finally {await browser.close();fs.writeFileSync(`/results/pool${baseline?'-baseline':''}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
