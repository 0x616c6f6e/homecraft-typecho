const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const mode=process.argv[2]||'query';
  const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report={scope:'Native in-scene article browser',mode,checks:[]};
  try{
    for(const [name,base,width]of[['desktop','http://127.0.0.1:18094/',1280],['mobile-sized-subdirectory','http://127.0.0.1:18095/journal/',390]]){
      const context=await browser.newContext({viewport:{width,height:844}});
      const page=await context.newPage();const errors=[],http=[],frameEngines=[];let validationErrors=0;
      page.on('pageerror',e=>errors.push(e.message));
      page.on('response',r=>{
        const path=new URL(r.url()).pathname;
        if(r.status()===500&&r.request().method()==='POST'&&/\/comment\/?$/.test(path)){validationErrors++;return;}
        if(r.status()>=400&&!(r.status()===403&&path.endsWith('/phase5-protected.html')))http.push({status:r.status(),path});
      });
      page.on('request',r=>{if(r.frame()!==page.mainFrame()&&/\/(engine|world|vendor)\/.*\.js/.test(r.url()))frameEngines.push(r.url());});
      const check=label=>{report.checks.push({name:mode+' '+name+': '+label,passed:true});console.log('PASS '+mode+' '+name+': '+label);};
      await page.goto(base);await page.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:90000});
      assert.equal(await page.evaluate(()=>window.__homeStartupError||null),null);
      await page.locator('#loading').waitFor({state:'detached'});
      await page.locator('.scene-reader-launch').waitFor({state:'visible'});
      assert.equal(await page.locator('#panel iframe').count(),0);
      const home=await page.locator('#homecraft-bootstrap').evaluate(n=>JSON.parse(n.textContent));
      assert.equal(home.urls.blog.includes('/index.php/'),mode==='query');
      await page.evaluate(()=>window.__home.go('blog'));
      const parentURL=page.url(),first=page.locator('#panel [data-recent-posts] a').first();
      const article=await first.getAttribute('href');await first.click();
      const frame=page.frameLocator('#panel iframe');
      await frame.locator('.content').waitFor();
      await page.waitForFunction(()=>document.querySelector('[data-browser-action=reload]')&&!document.querySelector('.scene-browser-status').textContent);
      assert.equal(page.url(),parentURL);
      assert.equal(await page.locator('#panel').getAttribute('data-station'),'reader');
      assert.equal(await page.locator('#panel .pop-out').getAttribute('href'),article);
      assert.equal(await page.locator('[data-browser-action=back]').isDisabled(),true);
      const start=await page.evaluate(()=>({x:window.__home.player.pos.x,z:window.__home.player.pos.z}));
      const renderFrame=await page.evaluate(()=>window.__home.stage.renderer.info.render.frame);
      await page.locator('[data-browser-action=reload]').focus();await page.keyboard.down('w');await page.waitForTimeout(500);await page.keyboard.up('w');
      assert.deepEqual(await page.evaluate(()=>({x:window.__home.player.pos.x,z:window.__home.player.pos.z})),start);
      assert.equal(await page.evaluate(()=>window.__home.stage.renderer.info.render.frame),renderFrame);
      check('summary opens the actual native article; scene position and URL remain unchanged');

      await page.locator('[data-browser-action=list]').click();await frame.locator('main article[data-post-id]').first().waitFor();
      await page.waitForFunction(()=>!document.querySelector('[data-browser-action=back]').disabled);
      await page.locator('[data-browser-action=back]').click();await frame.locator('.content').waitFor();
      await page.waitForFunction(url=>document.querySelector('#panel .pop-out').href===url,article);
      await page.locator('[data-browser-action=forward]').click();await frame.locator('main article[data-post-id]').first().waitFor();
      await page.locator('[data-browser-action=reload]').click();await frame.locator('main article[data-post-id]').first().waitFor();
      check('toolbar list, back, forward and reload preserve native document navigation');

      const next=frame.locator('.pagination .next a');
      if(await next.count()){
        await next.click();await frame.locator('.pagination .current').filter({hasText:'2'}).waitFor();
        check('native archive pagination stays inside the reader');
      }
      await frame.locator('#search-input').fill('Searchneedle');await frame.locator('.site-search button').click();
      await frame.locator('main article[data-post-id]').first().waitFor();
      await page.waitForFunction(()=>document.querySelector('.scene-browser-address').href.includes('Searchneedle'));
      assert.equal(page.url(),parentURL);check('native search submits in the iframe');

      // Exercise native page/password/comment UI using synthetic fixture URLs.
      const prefix=mode==='query'?'index.php/':'';
      const reading=base+prefix+'phase5-reading.html',protectedURL=base+prefix+'phase5-protected.html';
      await page.evaluate(url=>{
        const a=document.createElement('a');a.href=url;a.className='mc-button';a.textContent='Synthetic page';
        document.querySelector('#panel .body').append(a);a.click();
      },reading);
      await frame.locator('#comment-form').waitFor();
      await frame.locator('#comment-text').fill('');await frame.locator('#comment-text').pressSequentially('wasd');
      assert.equal(await frame.locator('#comment-text').inputValue(),'wasd');
      assert.deepEqual(await page.evaluate(()=>({x:window.__home.player.pos.x,z:window.__home.player.pos.z})),start);
      check('native comments remain usable and typing does not move the player');
      const marker=`Scene browser native comment ${mode} ${name} ${Date.now()}`;
      await frame.locator('#comment-author').fill('Synthetic scene reader');
      await frame.locator('#comment-mail').fill('invalid-mail');
      await frame.locator('#comment-text').fill('Synthetic recoverable reader draft');
      await frame.locator('#comment-form').evaluate(n=>n.noValidate=true);
      await frame.locator('#comment-form button[type=submit]').click();
      await frame.locator('body').filter({hasText:'邮箱地址不合法'}).waitFor();
      await page.locator('[data-browser-action=back]').click();
      await frame.locator('#comment-form').waitFor();
      assert.equal(await frame.locator('#comment-text').inputValue(),'Synthetic recoverable reader draft');
      assert.equal(await frame.locator('#comment-form button[type=submit]').isEnabled(),true);
      assert.equal(validationErrors,1);
      check('native validation errors stay visible and Back restores editable fields');
      await frame.locator('#comment-mail').fill('reader@example.invalid');
      await frame.locator('#comment-text').fill(marker);
      await frame.locator('#comment-form button[type=submit]').click();
      await frame.locator('.comment-content').filter({hasText:marker}).waitFor();
      assert.equal(page.url(),parentURL);
      check('native comment form submits inside the reader with original validation/anti-spam');
      await page.evaluate(url=>{
        const a=document.createElement('a');a.href=url;a.className='mc-button';a.textContent='Synthetic protected page';
        document.querySelector('#panel .body').append(a);a.click();
      },protectedURL);
      await frame.locator('input[type=password]').waitFor();
      assert.equal(await frame.locator('.content pre').count(),0);
      check('protected content still uses the native password gate');
      await frame.locator('input[type=password]').fill('fixture-password');
      await frame.locator('.protected input[type=submit]').click();
      await frame.locator('.content pre').waitFor();
      check('native password submission unlocks the document only inside its normal session');

      // Escape from the child document closes the native modal and removes it.
      await frame.locator('#comment-text').focus();await page.keyboard.press('Escape');
      await page.waitForFunction(()=>!document.querySelector('#panel').open);
      assert.equal(await page.locator('#panel iframe').count(),0);
      assert.equal(await page.locator('.scene-reader-launch').evaluate(n=>document.activeElement===n),true);
      await page.waitForFunction(n=>window.__home.stage.renderer.info.render.frame>n,renderFrame,{timeout:15000});
      check('Escape from an embedded form closes and disposes the reader, restoring focus');
      await page.locator('.scene-reader-launch').click();await frame.locator('main article[data-post-id]').first().waitFor();
      await page.evaluate(()=>window.__home.openPage('about'));
      assert.equal(await page.locator('.scene-browser-tools').isVisible(),false);
      assert.equal(await page.locator('#panel iframe').count(),0);
      const rejected=await page.evaluate(base=>{
        const values=['javascript:void(0)','https://example.invalid/',base+'admin/',base+'index.php/action/test',base+'usr/uploads/example.pdf'];
        for(const href of values){
          const a=document.createElement('a');a.className='mc-button';a.href=href;a.textContent='Synthetic guarded link';
          a.addEventListener('click',e=>e.preventDefault());document.querySelector('#panel .body').append(a);a.click();a.remove();
          if(document.querySelector('#panel').dataset.station!=='about')return false;
        }
        return true;
      },base);
      assert.ok(rejected);check('external, script, administration/action and upload URLs are not embedded');
      await page.keyboard.press('Escape');
      await page.locator('.scene-reader-launch').click();await frame.locator('main article[data-post-id]').first().waitFor();
      const layout=await page.locator('#panel').evaluate(n=>({width:n.getBoundingClientRect().width,height:n.getBoundingClientRect().height,vw:innerWidth,vh:innerHeight}));
      assert.ok(layout.width<=layout.vw&&layout.height<=layout.vh);
      await page.screenshot({path:`/results/scene-browser-${mode}-${name}.png`});
      await page.locator('#panel .close').click();await page.waitForFunction(()=>!document.querySelector('#panel').open);
      await page.locator('.scene-reader-launch').click();await frame.locator('main article[data-post-id]').first().waitFor();
      await frame.locator('.site-header nav a').first().click();await page.waitForFunction(()=>!document.querySelector('#panel').open);
      check('reopen, station switch and Home avoid nested scenes; responsive viewport and close button work');
      if(name==='desktop'){
        await page.route(article,route=>route.abort());
        await page.evaluate(()=>window.__home.go('blog'));await page.locator('#panel [data-recent-posts] a').first().click();
        await page.locator('.scene-browser-status').filter({hasText:/无法|较慢|cannot|slow/}).waitFor({timeout:20000});
        assert.equal(await page.locator('#panel .pop-out').getAttribute('href'),article);
        await page.locator('#panel .close').click();await page.unroute(article);
        check('failed embedded document keeps a usable new-tab escape and close control');
      }
      assert.deepEqual(frameEngines,[]);assert.deepEqual(errors,[]);assert.deepEqual(http,[]);
      await context.close();
    }
    for(const fallback of ['plain','blocked-engine']){
      const c=await browser.newContext();const p=await c.newPage();
      if(fallback==='blocked-engine')await p.route('**/engine/main.js',r=>r.abort());
      await p.goto('http://127.0.0.1:18094/'+(fallback==='plain'?'?plain=1':''));
      await p.locator('body.hc-fallback').waitFor();
      assert.equal(await p.locator('.scene-reader-launch:visible').count(),0);
      assert.equal(await p.locator('iframe').count(),0);
      await p.locator('[data-station=blog] a.mc-button').click();assert.ok(await p.locator('main article').count()>0);
      report.checks.push({name:mode+': '+fallback+' retains ordinary reading links',passed:true});
      await c.close();
    }
    const noJS=await browser.newContext({javaScriptEnabled:false});const p=await noJS.newPage();
    await p.goto('http://127.0.0.1:18094/');assert.equal(await p.locator('.scene-reader-launch').count(),0);
    await p.locator('[data-station=blog] a.mc-button').click();assert.ok(await p.locator('main article').count()>0);
    report.checks.push({name:mode+': no-JavaScript links retain full-page reading',passed:true});
  }catch(e){report.error=String(e.stack);process.exitCode=1;}
  finally{await browser.close();fs.writeFileSync(`/results/scene-browser-${mode}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
