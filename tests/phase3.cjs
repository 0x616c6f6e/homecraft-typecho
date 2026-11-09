const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const fs = require('node:fs');

(async () => {
  const mode = process.argv[2] || 'query';
  const password = fs.readFileSync('/run/secrets/theme-dev-password', 'utf8').trim();
  const browser = await chromium.launch({ args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
  const report = { scope: 'Phase 3 native content integration', mode, checks: [] };
  const check = name => report.checks.push({ name, passed: true });
  const read = page => page.locator('#homecraft-bootstrap').evaluate(el => JSON.parse(el.textContent));
  const publicOnly = data => {
    assert.equal(data.posts.length, 10);
    assert.ok(data.posts.every(p => p.title.startsWith('Phase3 public ')));
    assert.deepEqual(data.posts.map(p => p.title.slice(0, 16)), Array.from({ length: 10 }, (_, i) => `Phase3 public ${String(i+1).padStart(2,'0')}`));
    assert.equal(JSON.stringify(data).includes('_BODY_SECRET'), false);
    assert.equal(JSON.stringify(data).includes('fixture-password'), false);
    for (const p of data.posts) assert.deepEqual(Object.keys(p).sort(), ['excerpt','id','publishedAt','title','url']);
  };
  const getPublic = async (request, base) => {
    const response = await request.get(base + '?plain=1');
    assert.equal(response.status(), 200);
    const match = (await response.text()).match(/<script id="homecraft-bootstrap" type="application\/json">([\s\S]*?)<\/script>/);
    return JSON.parse(match[1]);
  };
  try {
    for (const [name, base] of [['root','http://127.0.0.1:18094/'], ['subdirectory','http://127.0.0.1:18095/journal/']]) {
      const context = await browser.newContext({ viewport: { width: name === 'root' ? 1280 : 390, height: 844 } });
      const page = await context.newPage();
      const errors = [], loaded = [];
      page.on('pageerror', error => errors.push(error.message));
      page.on('request', request => loaded.push(request.url()));
      await page.goto(base + '?plain=1');
      await page.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
      const home = await read(page);
      publicOnly(home);
      assert.equal(home.urls.blog.includes('/index.php/'), mode === 'query');
      assert.equal(await page.locator('[data-recent-posts] li').count(), 10);
      assert.equal(await page.evaluate(() => Boolean(window.PHASE3_INJECTED)), false);
      check(`${name}: public summaries fill limit after filtering all protected/non-public/future fixtures`);

      // Verify copied dialog cards use the same safe JS-generated summaries.
      await page.goto(base);
      await page.waitForFunction(() => window.__home?.player || window.__homeStartupError, null, { timeout: 60000 });
      assert.equal(await page.evaluate(() => window.__homeStartupError || null), null);
      await page.locator('#loading').waitFor({ state: 'detached', timeout: 15000 });
      await page.evaluate(() => window.__home.go('blog'));
      await page.waitForFunction(() => document.querySelector('#panel')?.open);
      assert.equal(await page.locator('#panel [data-recent-posts] li').count(), 10);
      assert.equal(await page.evaluate(() => Boolean(window.PHASE3_INJECTED)), false);
      await page.screenshot({ path: `/results/phase3-${mode}-${name}-scene.png` });
      check(`${name}: scene summary card and script-like title remain safe`);

      loaded.length = 0;
      await page.goto(home.posts[0].url);
      await page.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
      assert.ok((await page.locator('.content').innerText()).includes('Additional article content'));
      const category = await page.locator('.category-link').first().getAttribute('href');
      const tag = await page.locator('.tag-link').first().getAttribute('href');
      const author = await page.locator('.author-link').first().getAttribute('href');
      const month = await page.locator('.date-link').first().getAttribute('href');
      const traverse = async (url, expectedCount, requiredFragment) => {
        const seen = [];
        let current = url, previous = null;
        for (let guard=0; current && guard<15; guard++) {
          const response = await page.goto(current);
          assert.equal(response.status(), 200);
          await page.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
          const data = await read(page);
          assert.ok(data.pagination);
          const ids = await page.locator('article[data-post-id]').evaluateAll(nodes => nodes.map(node => Number(node.dataset.postId)));
          assert.ok(ids.length > 0 && ids.length <= 5);
          seen.push(...ids);
          if (data.pagination.nextUrl) {
            const native = await page.locator('.pagination .next a').getAttribute('href');
            assert.equal(data.pagination.nextUrl, native);
            if (requiredFragment) assert.ok(native.includes(requiredFragment));
          }
          assert.equal(data.pagination.previousUrl === null, previous === null);
          assert.equal((await page.content()).includes('_BODY_SECRET'), false);
          previous = current;
          current = data.pagination.nextUrl;
        }
        assert.equal(current, null, 'Pagination did not terminate');
        assert.equal(new Set(seen).size, seen.length, 'Duplicate pagination rows');
        if (expectedCount !== null) assert.equal(seen.length, expectedCount);
        return seen;
      };
      const categoryIds = await traverse(category, 13, 'phase3-public');
      const tagIds = await traverse(tag, 13, 'phase3-tag');
      assert.deepEqual(tagIds, categoryIds);
      check(`${name}: native category/tag pagination returns all 13 rows once in order`);

      await page.locator('#search-input').fill('Searchneedle');
      await Promise.all([page.waitForNavigation(), page.locator('.site-search button').click()]);
      const searchURL = page.url();
      const searchIds = await traverse(searchURL, 13, 'Searchneedle');
      assert.deepEqual(searchIds, categoryIds);
      assert.equal(await page.locator('#search-input').inputValue(), 'Searchneedle');
      await page.locator('#search-input').fill('phase3-no-match-874298');
      await Promise.all([page.waitForNavigation(), page.locator('.site-search button').click()]);
      await page.waitForFunction(() => document.documentElement.dataset.enhanced === 'true');
      assert.ok((await page.locator('main').innerText()).includes('没有找到匹配'));
      const empty = await read(page);
      assert.equal(empty.pagination.totalPages, 0);
      assert.equal(empty.pagination.nextUrl, null);
      check(`${name}: native search preserves keywords across pages and handles empty results`);

      const authorIds = await traverse(author, null, '/author/');
      const monthIds = await traverse(month, null, null);
      assert.ok(categoryIds.every(id => authorIds.includes(id) && monthIds.includes(id)));
      check(`${name}: native author and month archives retain public posts and routing`);
      await page.goto(home.urls.blog);
      const protectedURL = await page.locator('article h2 a').first().getAttribute('href');
      await page.goto(protectedURL);
      assert.equal((await page.content()).includes('PHASE3_PROTECTED_BODY_SECRET'), false);
      assert.equal(await page.locator('input[name="protectPassword"]').count(), 1);
      await page.locator('input[name="protectPassword"]').fill('fixture-password');
      await Promise.all([page.waitForNavigation(), page.locator('form.protected input[type="submit"]').click()]);
      assert.ok((await page.locator('.content').innerText()).includes('PHASE3_PROTECTED_BODY_SECRET'));
      publicOnly(await getPublic(context.request, base));
      check(`${name}: native password gate works; unlocked cookie still cannot expose protected summaries`);
      assert.equal(loaded.some(url => /\/themes\/homecraft-typecho\/(engine|world|vendor)\//.test(url)), false);
      assert.deepEqual(errors, []);
      check(`${name}: content discovery/reading stays scene-free with no page exceptions`);
      await context.close();

      const noJS = await browser.newContext({ javaScriptEnabled: false });
      const text = await noJS.newPage();
      await text.goto(base);
      assert.equal(await text.locator('[data-recent-posts] li').count(), 10);
      await text.locator('[data-recent-posts] a').first().click();
      assert.ok((await text.locator('.content').innerText()).includes('Searchneedle'));
      check(`${name}: server-rendered summary navigation works without JavaScript`);
      await noJS.close();

      const admin = await browser.newContext();
      const editor = await admin.newPage();
      await editor.goto(base+'admin/login.php');
      await editor.locator('#name').fill('theme-dev');
      await editor.locator('#password').fill(password);
      await Promise.all([editor.waitForURL(url => url.pathname.includes('/admin/') && !url.pathname.endsWith('login.php')), editor.locator('button[type="submit"]').click()]);
      publicOnly(await getPublic(admin.request, base));
      check(`${name}: authenticated author receives the same strictly public scene summaries`);
      await admin.close();
    }

    // A real authoring cycle verifies updates through Typecho rather than only fixture SQL.
    const admin = await browser.newContext();
    const editor = await admin.newPage();
    const base = 'http://127.0.0.1:18094/';
    await editor.goto(base+'admin/login.php');
    await editor.locator('#name').fill('theme-dev');
    await editor.locator('#password').fill(password);
    await Promise.all([editor.waitForURL(url => url.pathname.includes('/admin/') && !url.pathname.endsWith('login.php')), editor.locator('button[type="submit"]').click()]);
    await editor.goto(base+'admin/write-post.php');
    const title = `Phase3 lifecycle ${mode} ${Date.now()}`;
    await editor.locator('#title').fill(title);
    await editor.locator('#text').fill('Synthetic lifecycle body.');
    await Promise.all([editor.waitForNavigation(), editor.locator('#btn-save').click()]);
    const editURL = editor.url();
    assert.equal((await getPublic(admin.request, base)).posts.some(p => p.title === title), false);
    await editor.goto(editURL);
    await Promise.all([editor.waitForNavigation(), editor.locator('#btn-submit').click()]);
    let found = false, publishedPost = null;
    for (let attempt=0; attempt<20; attempt++) {
      publishedPost = (await getPublic(admin.request, base)).posts.find(p => p.title === title);
      if (publishedPost) { found=true; break; }
      await editor.waitForTimeout(250);
    }
    assert.equal(found, true, 'Published native post did not appear');
    await editor.goto(base+'admin/write-post.php?cid='+publishedPost.id);
    if (!(await editor.locator('#advance-panel').evaluate(el => el.open))) await editor.locator('#advance-panel summary').click();
    await editor.locator('#visibility').selectOption('private');
    await Promise.all([editor.waitForNavigation(), editor.locator('#btn-submit').click()]);
    assert.equal((await getPublic(admin.request, base)).posts.some(p => p.title === title), false);
    check('native admin draft → publish → private changes summary visibility without rebuilding');
    await admin.close();
  } catch (error) {
    report.error = String(error.stack).split(password).join('[REDACTED]');
    process.exitCode = 1;
  } finally {
    await browser.close();
    fs.writeFileSync(`/results/phase3-${mode}.json`, JSON.stringify(report, null, 2));
    console.log(JSON.stringify(report, null, 2));
  }
})();
