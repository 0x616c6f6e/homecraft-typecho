const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
 const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 const report={scope:'Scene workload and actual WebGL context-loss recovery, not reproduction of a desktop browser process crash',checks:[]};
 try {
  for(const [name,url,width,height,mobile,budget] of [
   ['large-desktop','http://127.0.0.1:18094/',2560,1440,false,1500000],
   ['mobile-subdirectory','http://127.0.0.1:18095/journal/',390,844,true,800000]
  ]){
   const context=await browser.newContext({viewport:{width,height},deviceScaleFactor:2,isMobile:mobile,hasTouch:mobile});
   const page=await context.newPage(); const errors=[];
   page.on('pageerror',e=>errors.push(e.message));page.on('crash',()=>errors.push('Page process crashed'));
   const check=label=>{report.checks.push({name:name+': '+label,passed:true});console.log('PASS '+name+': '+label);};
   await page.goto(url);await page.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:90000});
   assert.equal(await page.evaluate(()=>window.__homeStartupError||null),null);
   await page.locator('.scene-reader-launch').waitFor({state:'visible'});
   const quality=await page.evaluate(()=>{const s=window.__home.stage;return {width:s.renderer.domElement.width,height:s.renderer.domElement.height,ratio:s.renderer.getPixelRatio(),shadow:s.sun.shadow.mapSize.x};});
   assert.ok(quality.width*quality.height<=budget);assert.ok(quality.ratio<=1);assert.equal(quality.shadow,mobile?512:1024);
   check('high-DPI drawing buffer and shadow allocation stay within the reduced budgets');
   // Isolate the existing loop's clock to exercise 144 Hz deterministically;
   // rendering is suppressed only during this clock test, then restored.
   const frames=await page.evaluate(async()=>{
    const app=window.__home,raf=window.requestAnimationFrame,draw=app.stage.render;
    let next,resolve;const ready=new Promise(r=>resolve=r);
    window.requestAnimationFrame=cb=>{if(cb.name==='loop'){next=cb;resolve();return 0;}return raf(cb);};
    await ready;
    let calls=0;app.stage.render=()=>calls++;
    const start=performance.now()+100;
    for(let i=0;i<144;i++){const cb=next;next=null;cb(start+i*1000/144);}
    app.stage.render=draw;window.requestAnimationFrame=raf;raf(next);
    return calls;
   });
   assert.ok(frames>=24&&frames<=31, '144 Hz clock yielded '+frames+' scene frames');
   check('one second of simulated 144 Hz display callbacks runs at most 31 scene frames');
   await page.evaluate(()=>{
    window.__updates=0;window.__savedApp=window.__home;
    const update=window.__home.player.update;
    window.__home.player.update=function(...args){window.__updates++;return update.apply(this,args);};
   });
   for(let i=0;i<5;i++){
    await page.locator('.scene-reader-launch').click();
    await page.frameLocator('#panel iframe').locator('main article[data-post-id]').first().waitFor();
    await page.waitForFunction(()=>!document.querySelector('.scene-browser-status').textContent);
    const before=await page.evaluate(()=>({updates:window.__updates,frame:window.__home.stage.renderer.info.render.frame}));
    await page.waitForTimeout(500);
    assert.deepEqual(await page.evaluate(()=>({updates:window.__updates,frame:window.__home.stage.renderer.info.render.frame})),before);
    await page.locator('#panel .close').click();
    await page.waitForFunction(n=>window.__updates>n,before.updates);
    assert.equal(await page.locator('#panel iframe').count(),0);
   }
   check('five reading cycles suspend scene updates and all GPU drawing, dispose frames and resume');
   await page.locator('.scene-reader-launch').click();
   await page.frameLocator('#panel iframe').locator('main article[data-post-id]').first().waitFor();
   await page.evaluate(()=>{
    const gl=window.__home.stage.renderer.getContext(),extension=gl.getExtension('WEBGL_lose_context');
    if(!extension)throw Error('Context-loss test extension unavailable');
    extension.loseContext();
   });
   await page.waitForFunction(()=>document.body.classList.contains('hc-fallback'));
   assert.equal(await page.evaluate(()=>window.__homeStartupError.phase),'webgl-context');
   assert.equal(await page.locator('#panel iframe').count(),0);
   assert.equal(await page.locator('#panel').evaluate(n=>n.open),false);
   assert.equal(await page.locator('.scene-reader-launch').isVisible(),false);
   await page.locator('#pages [data-station=blog] .mc-button').waitFor({state:'visible'});
   const updates=await page.evaluate(()=>window.__updates);await page.waitForTimeout(600);
   assert.equal(await page.evaluate(()=>window.__updates),updates);
   const graph=await page.locator('#homecraft-bootstrap').evaluate(n=>JSON.parse(n.textContent));
   await page.locator('#pages [data-station=blog] .mc-button').click();
   await page.waitForURL(graph.urls.blog);
   assert.equal(await page.locator('#world').count(),0);
   check('real WEBGL_lose_context stops the scene, disposes reader and leaves a working native archive link');
   assert.deepEqual(errors,[]);await context.close();
  }
 } catch(e){report.error=String(e.stack);process.exitCode=1;}
 finally {await browser.close();fs.writeFileSync('/results/scene-stability.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
