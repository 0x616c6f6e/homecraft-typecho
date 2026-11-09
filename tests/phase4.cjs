const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');
(async () => {
  const mode = process.argv[2] || 'query';
  assert.ok(['query','rewritten'].includes(mode));
  const password = fs.readFileSync('/run/secrets/theme-dev-password','utf8').trim();
  const browser = await chromium.launch({ args: ['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader'] });
  const report = { scope: 'Phase 4 native theme settings', mode, checks: [] };
  const check = name => report.checks.push({name, passed:true});
  const bootstrap = page => page.locator('#homecraft-bootstrap').evaluate(el=>JSON.parse(el.textContent));
  try {
    for (const [name,base] of [['root','http://127.0.0.1:18094/'],['subdirectory','http://127.0.0.1:18095/journal/']]) {
      const admin = await browser.newContext();
      const editor = await admin.newPage();
      const guest = await browser.newContext({viewport:{width:name==='root'?1280:390,height:844}});
      const page = await guest.newPage();
      const errors=[]; page.on('pageerror',e=>errors.push(e.message));
      await editor.goto(base+'admin/login.php');
      await editor.locator('#name').fill('theme-dev'); await editor.locator('#password').fill(password);
      await Promise.all([editor.waitForURL(url=>url.pathname.includes('/admin/')&&!url.pathname.endsWith('login.php')),editor.locator('button[type=submit]').click()]);
      const settingsURL = base+'admin/options-theme.php';
      await editor.goto(settingsURL);
      const formSelector='form[action*="themes-edit"]';
      const original = await editor.locator(formSelector).evaluate(form=>Object.fromEntries(new FormData(form)));
      const choices = await editor.locator('select[name=hcAboutPage]').evaluate(el=>[...el.options].map(o=>({id:o.value,title:o.textContent.trim()})));
      const about=choices.find(o=>o.title==='Phase4 about');
      const book=choices.find(o=>o.title==='Phase4 guestbook');
      assert.ok(about && book, 'Missing fixture page options: '+JSON.stringify(choices));
      assert.equal(choices.some(o=>/Phase4 (private|protected|scheduled)/.test(o.title)),false);
      const guestChoices=await editor.locator('select[name=hcGuestbookPage]').innerText();
      assert.equal(guestChoices.includes('Phase4 closed'),false);
      check(`${name}: native settings discover only eligible public pages`);
      const save=async overrides=>{
        await editor.goto(settingsURL);
        const action=await editor.locator(formSelector).getAttribute('action');
        const response=await admin.request.post(action,{form:{...original,...overrides},headers:{referer:settingsURL},maxRedirects:0});
        assert.ok([302,303].includes(response.status()),`Settings HTTP ${response.status()}`);
      };
      const view=async()=>{
        const response=await page.goto(base+'?plain=1'); assert.equal(response.status(),200);
        await page.waitForFunction(()=>document.documentElement.dataset.enhanced==='true');
        return bootstrap(page);
      };
      const editPage=async(id,{visibility,comments}={})=>{
        await editor.goto(base+'admin/write-page.php?cid='+id);
        await editor.locator('details').evaluateAll(nodes=>nodes.forEach(n=>n.open=true));
        if(visibility) await editor.locator('#visibility').selectOption(visibility);
        if(comments!==undefined) await editor.locator('#allowComment').setChecked(comments);
        await Promise.all([editor.waitForNavigation(),editor.locator('#btn-submit').click()]);
      };
      const asset=base+'usr/themes/homecraft-typecho/';
      const values={hcName:'Owner <script>window.SETTINGS_INJECTED=true</script>',hcIntroduction:'Hello <img src=x onerror="window.SETTINGS_INJECTED=true">\nSecond line',hcRecentCount:'3',hcLanguage:'en',hcSkin:asset+'assets/skin-template.png',hcLogo:asset+'assets/favicon.png',hcFavicon:asset+'assets/favicon.png',hcGithubUrl:'https://github.com/example',hcWebsiteUrl:'https://example.invalid/',hcXUrl:'',hcAboutPage:about.id,hcGuestbookPage:book.id,hcHomepage:'scene',hcWeatherEnabled:'0'};
      try {
        await save(values);
        let data=await view();
        assert.equal(data.posts.length,3); assert.equal(data.scene.name,values.hcName);
        assert.equal(data.site.language,'en'); assert.equal(data.profile.introduction,values.hcIntroduction);
        assert.equal(await page.locator('#pages [data-station=about] img').count(),0);
        assert.equal(await page.evaluate(()=>Boolean(window.SETTINGS_INJECTED)),false);
        assert.ok(data.pages.about.url.startsWith(base)); assert.ok(data.pages.guestbook.url.startsWith(base));
        assert.ok(data.scene.dock.includes('mailbox')); assert.equal(data.profile.links.length,2);
        assert.equal(await page.locator('link[rel=icon]').getAttribute('href'),values.hcFavicon);
        assert.ok((await page.locator('[data-station=blog] h2').innerText()).includes('Posts'));
        check(`${name}: native save updates identity, language, count, images, links and page mappings safely`);

        for(const bad of [{hcRecentCount:'21'},{hcGithubUrl:'javascript:alert(1)'},{hcAboutPage:'2147483647'},{hcWeatherEnabled:'1',hcWeatherCity:'Test',hcWeatherLatitude:'999',hcWeatherLongitude:'0',hcWeatherTimezone:'UTC'}]){
          await save({...values,...bad,hcName:'Rejected settings'});
          data=await view(); assert.equal(data.scene.name,values.hcName); assert.equal(data.posts.length,3);
        }
        check(`${name}: server rejects invalid counts, unsafe links, forged pages and bad weather atomically`);
        await editor.goto(settingsURL);
        const forgedAction=await editor.locator(formSelector).getAttribute('action');
        await guest.request.post(forgedAction,{form:{...original,hcName:'Unauthenticated write'},maxRedirects:0});
        assert.equal((await view()).scene.name,values.hcName);
        check(`${name}: anonymous requests cannot change native theme settings`);

        await save({...values,hcRecentCount:'1'}); assert.equal((await view()).posts.length,1);
        await save({...values,hcRecentCount:'20'}); data=await view(); assert.ok(data.posts.length>3 && data.posts.length<=20);
        check(`${name}: supported summary-count boundaries work without rebuilding`);

        const weather={...values,hcWeatherEnabled:'1',hcWeatherCity:'Test City',hcWeatherCityEn:'Test City',hcWeatherLatitude:'31.23',hcWeatherLongitude:'121.47',hcWeatherTimezone:'UTC'};
        await save(weather);
        let weatherRequests=0;
        await page.route('https://api.open-meteo.com/**',route=>{weatherRequests++;return route.abort();});
        await page.goto(base);
        await page.waitForFunction(()=>window.__home?.player||window.__homeStartupError,null,{timeout:60000});
        assert.equal(await page.evaluate(()=>window.__homeStartupError||null),null);
        await page.locator('#loading').waitFor({state:'detached',timeout:15000});
        const engine=await page.evaluate(async()=> (await import('@config')).default);
        assert.equal(await page.locator('#hotbar [data-station=mailbox]').getAttribute('aria-label'),'Guestbook');
        assert.equal(engine.skin,values.hcSkin); assert.deepEqual(engine.languages,['en']); assert.equal(engine.weather.city,'Test City');
        assert.ok(weatherRequests>0);
        await page.evaluate(()=>window.__home.go('about'));
        await page.waitForFunction(()=>document.querySelector('#panel')?.open);
        assert.equal(await page.locator('#panel .body a').getAttribute('href'),(await bootstrap(page)).pages.about.url);
        await page.evaluate(()=>document.querySelector('#panel .close').click());
        await page.evaluate(()=>window.__home.go('mailbox'));
        await page.waitForFunction(()=>document.querySelector('#panel')?.open);
        assert.equal(await page.locator('#panel .body a').getAttribute('href'),(await bootstrap(page)).pages.guestbook.url);
        assert.equal(await page.locator('#panel form.mailbox').count(),0);
        assert.equal(await page.locator('html').getAttribute('lang'),'en');
        assert.equal(await page.evaluate(()=>Boolean(window.SETTINGS_INJECTED)),false);
        await page.screenshot({path:`/results/phase4-${name}-scene.png`});
        check(`${name}: English scene uses validated skin and page links; weather outage does not block startup`);

        for(const skin of [asset+'assets/og.jpg',asset+'assets/missing-skin.png']){
          await save({...values,hcSkin:skin}); await view();
          assert.equal(await page.evaluate(async()=> (await import('@config')).default.skin),'');
          assert.equal(await page.evaluate(()=>Boolean(window.__home)),false);
        }
        check(`${name}: wrong-size and unavailable skins fall back without starting 3D in plain mode`);

        await save({...values,hcHomepage:'reading'});
        const requested=[]; const listener=req=>requested.push(req.url()); page.on('request',listener);
        await page.goto(base); await page.waitForFunction(()=>document.documentElement.dataset.enhanced==='true');
        assert.ok(page.url().includes('/blog/')); assert.equal((await bootstrap(page)).view.sceneEnabled,false);
        assert.equal(requested.some(url=>/\/(engine|world|vendor)\//.test(url)),false);
        assert.equal(await page.locator('.site-name .brand-logo').getAttribute('src'),values.hcLogo);
        assert.ok((await page.locator('.site-name').innerText()).includes('Owner'));
        page.off('request',listener);
        check(`${name}: reading-only mode delegates to native archive without loading engine assets`);

        await save(values);
        await editPage(about.id,{visibility:'hidden'}); assert.equal((await view()).pages.about,null);
        await editPage(about.id,{visibility:'publish'}); assert.ok((await view()).pages.about);
        await editPage(book.id,{comments:false}); data=await view(); assert.equal(data.pages.guestbook,null); assert.equal(data.scene.dock.includes('mailbox'),false);
        await editPage(book.id,{comments:true}); assert.ok((await view()).pages.guestbook);
        await editor.goto(base+'admin/manage-pages.php');
        const deleteURL=await editor.locator('a[href*="contents-page-edit"][href*="do=delete"]').first().getAttribute('href');
        const deletion=await admin.request.post(deleteURL,{form:{'cid[]':about.id},headers:{referer:editor.url()},maxRedirects:0});
        assert.ok([302,303].includes(deletion.status()));
        assert.equal((await view()).pages.about,null);
        check(`${name}: hidden/deleted pages and closed guestbooks remove stale public entries`);
        assert.deepEqual(errors,[]);
      } finally {
        await save(original);
        await guest.close(); await admin.close();
      }
    }
  }catch(error){report.error=String(error.stack).split(password).join('[REDACTED]');process.exitCode=1;}
  finally{await browser.close();fs.writeFileSync(`/results/phase4-${mode}.json`,JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));}
})();
