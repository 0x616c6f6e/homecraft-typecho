const {chromium}=require('playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
(async()=>{
  const password=fs.readFileSync('/run/secrets/theme-dev-password','utf8').trim();
  const workspace='/release-workspace';
  const a=JSON.parse(fs.readFileSync(workspace+'/releases/A/homecraft-typecho/release.json'));
  const b=JSON.parse(fs.readFileSync(workspace+'/releases/B/homecraft-typecho/release.json'));
  const switchRelease=slot=>{const next=workspace+'/active.next';try{fs.unlinkSync(next);}catch(e){if(e.code!=='ENOENT')throw e;}fs.symlinkSync(`releases/${slot}/homecraft-typecho`,next);fs.renameSync(next,workspace+'/active');};
  const switchAndReload=async slot=>{
    switchRelease(slot);
    const request=slot+'-'+Date.now();
    fs.writeFileSync(workspace+'/reload-request',request);
    for(let i=0;i<300;i++) {
      if(fs.existsSync(workspace+'/reload-complete')&&fs.readFileSync(workspace+'/reload-complete','utf8')===request)return;
      await new Promise(resolve=>setTimeout(resolve,100));
    }
    throw Error('Test PHP worker reload did not complete');
  };
  switchRelease('A');
  const browser=await chromium.launch({args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
  const report={scope:'Phase 6 packaged release lifecycle',checks:[]};
  const check=name=>{report.checks.push({name,passed:true});console.log('PASS '+name);};
  const sessions=[];
  const data=p=>p.locator('#homecraft-bootstrap').evaluate(e=>JSON.parse(e.textContent));
  try {
    for(const [name,base] of [['root','http://127.0.0.1:18096/'],['subdirectory','http://127.0.0.1:18097/journal/']]) {
      const admin=await browser.newContext();const editor=await admin.newPage();
      await editor.goto(base+'admin/login.php');await editor.locator('#name').fill('theme-dev');await editor.locator('#password').fill(password);
      await Promise.all([editor.waitForURL(u=>u.pathname.includes('/admin/')&&!u.pathname.endsWith('login.php')),editor.locator('button[type=submit]').click()]);
      const activate=async theme=>{
        await editor.goto(base+'admin/themes.php');
        assert.equal(await editor.locator(`#theme-${theme}`).count(),1,'Requested theme must exist');
        const link=editor.locator(`#theme-${theme} a.activate`);
        if(await link.count()) {const response=await admin.request.get(await link.getAttribute('href'),{headers:{referer:editor.url()},maxRedirects:0});assert.ok([302,303].includes(response.status()));}
        await editor.reload();assert.match(await editor.locator(`#theme-${theme}`).getAttribute('class'),/current/);
      };
      await activate('homecraft-typecho');
      const context=await browser.newContext({viewport:{width:name==='root'?1280:360,height:844}});
      const page=await context.newPage();const errors=[],http=[];
      page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)http.push([r.status(),r.url()]);});
      await page.goto(base);await page.waitForFunction(()=>document.documentElement.dataset.enhanced==='true');
      assert.equal((await data(page)).view.sceneEnabled,false);
      assert.ok((await data(page)).urls.assetBase.includes(a.assetId));
      const postURL=await page.locator('main article h2 a').first().getAttribute('href');
      assert.equal(postURL.includes('/index.php/'),name==='root');
      await page.goto(postURL);assert.equal(await page.locator('#comment-form').count(),1);
      check(`${name}: packaged theme activates natively with scene-free direct articles before homepage setup`);
      const createPage=async(title,slug,template)=>{
        await editor.goto(base+'admin/write-page.php');await editor.locator('#title').fill(title);await editor.locator('#slug').fill(slug);await editor.locator('#text').fill('Release lifecycle content stays intact.');
        await editor.locator('details').evaluateAll(es=>es.forEach(e=>e.open=true));
        if(template){await editor.locator('#template').selectOption(template);await editor.locator('#allowComment').uncheck();}
        await Promise.all([editor.waitForNavigation(),editor.locator('#btn-submit').click()]);
        await editor.waitForTimeout(1100); // Native public queries require created < current server time.
        await editor.goto(base+'admin/manage-pages.php?keywords='+encodeURIComponent(title));
        const row=editor.locator('tbody tr').filter({has:editor.locator('a',{hasText:title})});
        return {id:new URL(await row.locator('a:has(.i-edit)').getAttribute('href')).searchParams.get('cid'),url:await row.locator('a:has(.i-exlink)').getAttribute('href')};
      };
      const scene=await createPage('Release scene','release-scene','scene.php');
      const reading=await createPage('Release reading','release-reading',null);
      await editor.goto(reading.url);await editor.locator('#comment-text').fill('Release comment survives upgrade and rollback.');
      await Promise.all([editor.waitForNavigation(),editor.locator('#comment-form button[type=submit]').click()]);
      const setReading=async front=>{
        await editor.goto(base+'admin/options-reading.php');await editor.locator('#frontPage-'+front).check();
        if(front==='page'){await editor.locator('[name=frontPagePage]').selectOption(scene.id);await editor.locator('#frontArchive').check();await editor.locator('[name=archivePattern]').fill('/blog');}
        await Promise.all([editor.waitForNavigation(),editor.locator('form button[type=submit]').click()]);
      };
      await setReading('page');
      await page.goto(base);await page.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:60000});assert.equal(await page.evaluate(()=>window.__homeStartupError||null),null);
      await page.locator('#loading').waitFor({state:'detached'});
      await page.evaluate(()=>window.__home.go('blog'));
      await page.waitForFunction(()=>document.querySelector('#panel')?.open);
      assert.ok(await page.locator('#panel [data-recent-posts] li').count()>0);
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('canvas').count()>0,true);
      const html=await context.request.get(base);assert.ok(html.headers()['cache-control'].includes('no-store'));
      const assetURL=(await data(page)).urls.assetBase+'js/app.js';
      const asset=await context.request.get(assetURL);assert.equal(asset.status(),200);assert.ok(asset.headers()['cache-control'].includes('immutable'));assert.ok(asset.headers()['content-type'].includes('javascript'));
      const before=await asset.body();
      // Keep this fully initialized A page open while another tab loads the replacement.
      const fresh=await context.newPage();
      fresh.on('pageerror',e=>errors.push(e.message));fresh.on('response',r=>{if(r.status()>=400)http.push([r.status(),r.url()]);});
      sessions.push({name,base,admin,editor,context,page,fresh,reading,postURL,activate,setReading,assetURL,before,errors,http});
      await page.screenshot({path:`/results/phase6-${name}-installed.png`});
      assert.deepEqual(errors,[]);assert.deepEqual(http,[]);
      check(`${name}: native scene-page setup starts packaged 3D with immutable assets and no-store HTML`);
    }
    await switchAndReload('B');
    for(const s of sessions) {
      const {name,base,context,page,fresh,reading,assetURL,before}=s;
      await fresh.bringToFront();
      await fresh.goto(base);
      await fresh.waitForFunction(()=>document.documentElement.dataset.enhanced==='true',null,{timeout:15000});
      await fresh.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:60000});assert.equal(await fresh.evaluate(()=>window.__homeStartupError||null),null);
      assert.ok((await data(fresh)).urls.assetBase.includes(b.assetId));
      assert.equal(await page.evaluate(()=>Boolean(window.__home?.player)),true);
      const old=await context.request.get(assetURL);assert.equal(old.status(),200);assert.deepEqual(await old.body(),before);
      await fresh.goto(reading.url);assert.ok((await fresh.locator('.content').innerText()).includes('Release lifecycle content'));
      assert.ok((await fresh.locator('#comments').innerText()).includes('Release comment survives'));
      assert.ok((await data(fresh)).urls.assetBase.includes(b.assetId));
      check(`${name}: warm-cache upgrade selects the new graph while open old pages and native content remain intact`);
    }
    await switchAndReload('rollback');
    for(const s of sessions) {
      const {name,base,context,fresh,reading,postURL,activate,setReading}=s;
      await fresh.goto(reading.url);assert.ok((await data(fresh)).urls.assetBase.includes(a.assetId));
      const newer=(await data(fresh)).urls.themeBase+'static/'+b.assetId+'/js/app.js';assert.equal((await context.request.get(newer)).status(),200);
      assert.ok((await fresh.locator('#comments').innerText()).includes('Release comment survives'));
      await fresh.bringToFront();
      await fresh.goto(base);
      await fresh.waitForFunction(()=>document.documentElement.dataset.enhanced==='true',null,{timeout:15000});
      await fresh.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:60000});assert.equal(await fresh.evaluate(()=>window.__homeStartupError||null),null);
      check(`${name}: rollback restarts the original scene and retains newer assets without deleting content`);
      await setReading('recent');await activate('default');
      await fresh.bringToFront();
      await fresh.goto(base);assert.equal(await fresh.locator('#homecraft-bootstrap').count(),0);assert.equal((await fresh.locator('body').innerText()).includes('Fatal error'),false);
      await fresh.goto(postURL);assert.equal((await fresh.locator('body').innerText()).includes('Fatal error'),false);
      await fresh.goto(reading.url);assert.ok((await fresh.locator('body').innerText()).includes('Release lifecycle content'));assert.ok((await fresh.locator('body').innerText()).includes('Release comment survives'));
      check(`${name}: restoring Reading settings and switching to the default theme preserves pages and comments`);
      assert.deepEqual(s.errors,[]);assert.deepEqual(s.http,[]);
    }
  }catch(error){report.diagnostics=await Promise.all(sessions.map(async s=>({name:s.name,url:s.fresh.url(),errors:s.errors,http:s.http,body:await s.fresh.locator('body').innerText().catch(()=>''),bootstrap:await data(s.fresh).catch(()=>null)})));report.error=String(error.stack).split(password).join('[REDACTED]');process.exitCode=1;}
  finally{switchRelease('A');await browser.close();fs.writeFileSync('/results/phase6.json',JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
