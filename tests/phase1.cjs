const { chromium } = require('playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');

(async () => {
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const base = 'http://127.0.0.1:18094/';
  const report = { scope: 'Phase 1 proof of concept only', checks: [], knownLimitations: [] };
  const sceneAssets = url => /\/themes\/homecraft-typecho\/(engine|world|vendor)\//.test(url);
  try {
    for (const [name, options] of [['desktop', { viewport: { width: 1280, height: 800 } }], ['mobile', { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]]) {
      const context = await browser.newContext(options);
      const page = await context.newPage();
      const failures = [], errors = [], failedRequests = [], sceneRequests = [];
      page.on('request', request => sceneRequests.push(request.url()));
      page.on('requestfailed', request => failedRequests.push({url: request.url(), error: request.failure()?.errorText}));
      page.on('response', response => { if (response.status() >= 400) failures.push({ url: response.url(), status: response.status() }); });
      page.on('pageerror', error => errors.push(error.message));
      const response = await page.goto(base);
      assert.equal(response.status(), 200);
      await page.waitForFunction(() => window.__home?.player || window.__homeStartupError, null, { timeout: 60000 });
      assert.equal(await page.evaluate(() => window.__homeStartupError || null), null);
      await page.waitForFunction(() => document.querySelector('#scene-status').textContent.includes('已就绪'));
      await page.locator('#loading').waitFor({ state: 'detached', timeout: 15000 });
      await page.evaluate(() => window.__home.go('blog'));
      await page.waitForFunction(() => document.querySelector('#panel')?.open);
      const blog = await page.locator('#panel .body a').getAttribute('href');
      assert.ok(new URL(blog).pathname.includes('/blog'));
      await page.screenshot({ path: `/results/${name}-scene.png` });
      const stats = await page.evaluate(() => window.__home.stats());
      assert.deepEqual(errors, []);
      assert.deepEqual(failedRequests, []);
      assert.equal(sceneRequests.some(url => new URL(url).pathname.endsWith('/homecraft.json')), false);
      assert.equal(sceneRequests.some(url => new URL(url).pathname.endsWith('/js/traveller.js')), true);
      assert.deepEqual(failures, []);
      report.checks.push({ name: `${name}: scene startup and blog card`, passed: true, stats });
      report.knownLimitations.push(...[...failures, ...failedRequests].map(f => ({ ...f, context: name })));
      const requested = [];
      page.on('request', request => requested.push(request.url()));
      await page.goto(blog);
      await page.waitForLoadState('networkidle');
      assert.ok((await page.locator('main').innerText()).includes('Synthetic migration article'));
      assert.equal(requested.some(sceneAssets), false);
      const post = await page.locator('article h2 a').first().getAttribute('href');
      await page.goto(post);
      assert.ok((await page.locator('.content').innerText()).includes('synthetic test content'));
      assert.equal(requested.some(sceneAssets), false);
      report.checks.push({ name: `${name}: native blog and direct post without scene assets`, passed: true });
      await context.close();
    }
    const noJS = await browser.newContext({ javaScriptEnabled: false });
    const text = await noJS.newPage();
    await text.goto(base);
    assert.equal(await text.locator('.reading-entry a').isVisible(), true);
    assert.equal(await text.locator('#pages').isVisible(), true);
    report.checks.push({ name: 'JavaScript disabled: readable fallback and navigation', passed: true });
    await noJS.close();

    const broken = await browser.newPage();
    await broken.route('**/engine/main.js', route => route.abort());
    await broken.goto(base);
    await broken.waitForFunction(() => document.body.classList.contains('hc-fallback'));
    assert.equal(await broken.locator('.reading-entry a').isVisible(), true);
    assert.equal(await broken.locator('#pages').isVisible(), true);
    report.checks.push({ name: 'Blocked engine module: fallback exposed', passed: true });
    await broken.close();

    const plain = await browser.newPage();
    const loaded = [];
    plain.on('request', req => loaded.push(req.url()));
    await plain.goto(base + '?plain=1');
    await plain.waitForLoadState('networkidle');
    assert.equal(loaded.some(sceneAssets), true); // Engine stylesheet is expected.
    assert.equal(loaded.some(url => /\/(engine|world|vendor)\/.*\.js/.test(url)), false);
    assert.equal(await plain.locator('#pages').isVisible(), true);
    report.checks.push({ name: 'Explicit plain mode: no 3D JavaScript modules', passed: true });
    await plain.close();
  } catch (error) {
    report.error = error.stack;
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync('/results/phase1.json', JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  }
})();
