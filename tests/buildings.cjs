const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={scope:'Village buildings',checks:[]};
 try {
  for(const [name,base,width] of [['desktop','http://127.0.0.1:18094/',1280],['mobile-subdirectory','http://127.0.0.1:18095/journal/',390]]) {
   const context=await browser.newContext({viewport:{width,height:844}});const page=await context.newPage();const errors=[],http=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)http.push([r.status(),r.url()]);});
   await page.goto(base);await page.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:60000});
   assert.equal(await page.evaluate(()=>window.__homeStartupError||null),null);
   await page.locator('#loading').waitFor({state:'detached'});
   assert.equal(await page.locator('#homecraft-bootstrap').evaluate(e=>JSON.parse(e.textContent).scene.preset),'village','Select the village preset in native theme settings before this test.');
   const result=await page.evaluate(()=>{
    const {world,nav}=window.__home;
    const buildings=world.village.buildings.map(b=>{
     const x=(b.door[0]+b.door[1])/2;
     const collision={x:b.x0-.75,z:b.z0+2};nav.move(collision,1.5,0);
     return {id:b.id,wallStops:collision.x<b.x0,wallSolid:!!world.grid.type(b.x0,0,b.z0),doorClear:!world.grid.type(x,0,b.z1-1)&&!world.grid.type(x,1,b.z1-1),interior:nav.canStand(x,b.z1-2),entrance:nav.canStand(x,b.z1+.5),path:nav.findPath({x:.5,z:18},{x,z:b.z1-2})?.length||0};
    });
    return {buildings,spawn:nav.canStand(.5,18),portal:nav.canStand(8,23.1),roof:world.ground.topAt(-12,-14),stats:window.__home.stats()};
   });
   assert.equal(result.buildings.length,3);
   for(const b of result.buildings){assert.ok(b.wallStops&&b.wallSolid&&b.doorClear&&b.interior&&b.entrance&&b.path>0,JSON.stringify(b));}
   assert.ok(result.spawn&&result.portal);assert.ok(result.roof?.y>=10);
   assert.ok(result.stats.calls<=60);assert.ok(result.stats.triangles<=200000);assert.ok(result.stats.lights<=2);
   await page.evaluate(()=>window.__home.go('blog'));await page.waitForFunction(()=>document.querySelector('#panel')?.open);
   assert.ok(await page.locator('#panel a').count()>0);
   await page.keyboard.press('Escape');
   // Face the village from the central entrance, after the intro camera settles.
   await page.evaluate(()=>window.__home.teleport(.5,16));
   await page.waitForTimeout(2000);
   result.streetStats=await page.evaluate(()=>window.__home.stats());
   assert.ok(result.streetStats.calls<=60&&result.streetStats.triangles<=200000&&result.streetStats.lights<=2);
   await page.screenshot({path:`/results/buildings-${name}.png`});
   assert.deepEqual(errors,[]);assert.deepEqual(http,[]);
   report.checks.push({name,passed:true,...result});console.log('PASS '+name);
   await context.close();
  }
 }catch(e){report.error=String(e.stack);process.exitCode=1;}
 finally{await browser.close();fs.writeFileSync('/results/buildings.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
