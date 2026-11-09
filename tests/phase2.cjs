const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { scope: 'Phase 2 theme skeleton', checks: [] };
  const sceneAsset = url => /\/themes\/homecraft-typecho\/(engine|world|vendor)\//.test(url);
  const check = name => report.checks.push({ name, passed: true });
  try {
    for (const [name, base, viewport] of [
      ['root', 'http://127.0.0.1:18094/', { width: 1280, height: 800 }],
      ['subdirectory', 'http://127.0.0.1:18095/journal/', { width: 360, height: 800 }],
    ]) {
      const context = await browser.newContext({ viewport, isMobile: name === 'subdirectory', hasTouch: name === 'subdirectory' });
      const page = await context.newPage();
      const errors = [], failures = [], loaded = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('requestfailed', request => failures.push(request.url()));
      page.on('request', request => loaded.push(request.url()));
      const response = await page.goto(base);
      assert.equal(response.status(), 200);
      await page.waitForFunction(() => window.__home?.player || window.__homeStartupError, null, { timeout: 60000 });
      assert.equal(await page.evaluate(() => window.__homeStartupError || null), null);
      await page.locator('#loading').waitFor({ state: 'detached', timeout: 15000 });
      assert.equal(await page.locator('html').getAttribute('data-view'), 'home');
      assert.equal(await page.locator('html').getAttribute('data-enhanced'), 'true');
      assert.equal(await page.locator('#world canvas').count(), 1);
      assert.equal(loaded.some(url => url.endsWith('/homecraft.json')), false);
      const data = await page.locator('#homecraft-bootstrap').evaluate(el => JSON.parse(el.textContent));
      for (const url of Object.values(data.urls)) assert.ok(url.startsWith(base), url);
      await page.evaluate(() => window.__home.go('blog'));
      await page.waitForFunction(() => document.querySelector('#panel')?.open);
      assert.equal(await page.locator('#panel .placeholder-card > a').getAttribute('href'), data.urls.blog);
      await page.screenshot({ path: `/results/phase2-${name}-scene.png` });
      assert.deepEqual(errors, []);
      assert.deepEqual(failures, []);
      check(`${name}: scene starts with native theme URLs and one renderer`);

      loaded.length = 0;
      const blog = await page.goto(data.urls.blog);
      assert.equal(blog.status(), 200);
      await page.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
      assert.equal(await page.locator('html').getAttribute('data-view'), 'archive');
      assert.equal(await page.locator('.site-header nav [aria-current="page"]').innerText(), '文章列表');
      const post = new URL('index.php/archives/1/', base).href;
      await page.goto(post);
      await page.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
      assert.equal(await page.locator('html').getAttribute('data-view'), 'post');
      assert.ok((await page.title()).includes('Synthetic migration article'));
      assert.ok((await page.locator('.content').innerText()).includes('synthetic test content'));
      assert.equal(await page.locator('link[rel="canonical"]').getAttribute('href'), post);
      const independentPage = await page.goto(base + 'index.php/start-page.html');
      assert.equal(independentPage.status(), 200);
      await page.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
      assert.equal(await page.locator('html').getAttribute('data-view'), 'page');
      assert.ok((await page.locator('main h1').innerText()).includes('About this test'));
      assert.equal(loaded.some(sceneAsset), false);
      await page.screenshot({ path: `/results/phase2-${name}-reading.png` });
      check(`${name}: shared post/page/list shell, canonical URL and scene-free reading`);

      const missing = await page.goto(base + 'index.php/phase2-missing-page');
      assert.equal(missing.status(), 404);
      await page.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
      assert.equal(await page.locator('html').getAttribute('data-view'), 'notFound');
      assert.equal(await page.locator('main h1').innerText(), '页面未找到');
      assert.equal(await page.locator('main a').getAttribute('href'), data.urls.blog);
      assert.equal(loaded.some(sceneAsset), false);
      assert.deepEqual(errors, []);
      assert.deepEqual(failures, []);
      check(`${name}: native 404 response and usable fallback template`);

      // Exercise the actual shipped validator against malformed/untrusted data.
      const validation = await page.evaluate(async url => {
        const { validateBootstrap } = await import(url);
        const good = JSON.parse(document.querySelector('#homecraft-bootstrap').textContent);
        const cases = [
          value => { value.schemaVersion = 999; },
          value => { value.urls.themeBase = 'javascript:alert(1)'; },
          value => { value.site.url = 'https://user:secret@example.invalid/'; },
          value => { value.view.sceneEnabled = true; },
          value => { value.scene.weather = { latitude: 999, longitude: 0 }; },
          value => { value.posts = [{ id: 1, title: '', excerpt: '', url: 'data:text/html,test', publishedAt: 'bad' }]; },
          value => { value.pagination = { currentPage: -1, totalPages: 2, previousUrl: null, nextUrl: null }; },
        ];
        return cases.every(mutate => {
          const copy = structuredClone(good);
          mutate(copy);
          try { validateBootstrap(copy); return false; } catch { return true; }
        });
      }, data.urls.themeBase + 'js/bootstrap.js');
      assert.equal(validation, true);
      check(`${name}: bootstrap rejects unsupported versions, unsafe URLs and malformed data`);
      await context.close();
    }

    const plain = await browser.newPage();
    const plainRequests = [];
    plain.on('request', request => plainRequests.push(request.url()));
    await plain.goto('http://127.0.0.1:18095/journal/?plain=1');
    await plain.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
    assert.equal(await plain.locator('#pages').isVisible(), true);
    assert.equal(plainRequests.some(url => /\/(engine|world|vendor)\/.*\.js/.test(url)), false);
    check('explicit plain mode skips engine JavaScript through shared app entry');
    await plain.close();

    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const text = await noJS.newPage();
    await text.goto('http://127.0.0.1:18095/journal/');
    assert.equal(await text.locator('#pages').isVisible(), true);
    assert.equal(await text.locator('.reading-entry a').isVisible(), true);
    await text.locator('.reading-entry a').click();
    assert.ok(await text.locator('main article').count() > 0);
    check('subdirectory no-JavaScript navigation and server-rendered content');
    await noJS.close();

    const broken = await browser.newPage();
    await broken.route('**/engine/main.js', route => route.abort());
    await broken.goto('http://127.0.0.1:18094/');
    await broken.waitForFunction(() => document.body.classList.contains('hc-fallback'));
    assert.equal(await broken.locator('#pages').isVisible(), true);
    check('blocked engine module keeps shared fallback usable');
    await broken.close();

    const invalid = await browser.newPage();
    const invalidRequests = [];
    invalid.on('request', request => invalidRequests.push(request.url()));
    await invalid.route('http://127.0.0.1:18094/', async route => {
      const original = await route.fetch();
      const body = (await original.text()).replace(/(<script id="homecraft-bootstrap" type="application\/json">)[\s\S]*?(<\/script>)/,
        '$1{"schemaVersion":999}$2');
      await route.fulfill({ response: original, body });
    });
    await invalid.goto('http://127.0.0.1:18094/');
    await invalid.waitForFunction(() => document.body.classList.contains('hc-fallback'));
    assert.equal(await invalid.locator('.reading-entry a').isVisible(), true);
    assert.equal(invalidRequests.some(url => /\/(engine|world|vendor)\/.*\.js/.test(url)), false);
    check('invalid bootstrap fails safely before loading scene code');
    await invalid.close();
  } catch (error) {
    report.error = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync('/results/phase2.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  }
})();
