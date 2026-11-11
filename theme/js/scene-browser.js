/** A small same-site reader inside the engine's existing modal/embed lifecycle. */
export function initSceneBrowser(data) {
  const english = data.site.language.startsWith('en');
  const text = (zh, en) => english ? en : zh;
  const site = new URL(data.site.url);
  const home = new URL(data.urls.home);
  const sitePath = site.pathname.replace(/\/?$/, '/');
  const homeURL = url => url.origin === home.origin && url.pathname === home.pathname && url.search === home.search;
  function readingURL(value) {
    try {
      const url = new URL(value, site);
      const path = decodeURIComponent(url.pathname);
      if (!['http:', 'https:'].includes(url.protocol) || url.origin !== site.origin
          || url.username || url.password || !path.startsWith(sitePath)
          || /\/(?:admin|usr|action)(?:\/|$)|\/(?:install|upgrade)\.php(?:\/|$)/i.test(path)
          || /\.(?:png|jpe?g|webp|gif|svg|pdf|zip|mp[34])$/i.test(path)
          || url.searchParams.has('action') || homeURL(url)) return null;
      return url;
    } catch { return null; }
  }
  const blog = readingURL(data.urls.blog);
  const pages = document.getElementById('pages');
  if (!blog || !pages) return { enable() {}, disable() {} };

  // Register a link-only page before the engine discovers its public stations.
  // A data-embed attribute does not request a document until it is opened.
  const reader = document.createElement('article');
  reader.className = 'page'; reader.hidden = true;
  reader.dataset.station = 'reader'; reader.dataset.icon = 'blog'; reader.dataset.embed = blog.href;
  const heading = document.createElement('h2');
  heading.textContent = text('文章浏览器', 'Article browser');
  reader.append(heading); pages.append(reader);

  const launch = document.createElement('button');
  launch.type = 'button'; launch.className = 'scene-reader-launch'; launch.hidden = true;
  launch.textContent = text('场景内阅读', 'Read here');
  document.querySelector('.reading-entry')?.append(launch);
  let panel, tools, message, address, back, forward, frame;
  let entries = [], cursor = -1, pending = null, timer = null, docEvents = null, returnFocus = null, readerActive = false;
  let renderInstalled = false;
  let awaitingForm = false, formError = false;
  const currentFrame = () => panel?.open && panel.dataset.station === 'reader' && frame?.isConnected;
  function status(value) { message.textContent = value; message.hidden = !value; }
  function updateControls(url) {
    back.disabled = cursor <= 0; forward.disabled = cursor >= entries.length - 1;
    address.href = url.href;
    address.textContent = url.pathname + url.search + url.hash;
    address.title = url.href;
    const popOut = panel.querySelector('.pop-out');
    popOut.href = url.href;
  }
  function loading(url) {
    clearTimeout(timer);
    updateControls(url);
    status(text('正在加载文章…', 'Loading…'));
    timer = setTimeout(() => {
      if (currentFrame()) status(text('加载较慢或页面不允许嵌入，可点击右上角 ↗ 打开。', 'Loading is slow or embedding is blocked. Use ↗ to open the page.'));
    }, 12000);
  }
  function navigate(url, index = null) {
    if (!currentFrame()) return;
    awaitingForm = formError = false;
    pending = index;
    loading(url);
    // Replacement navigation keeps toolbar history under this window's control.
    try { frame.contentWindow.location.replace(url.href); }
    catch { frame.src = url.href; }
  }
  function cleanup() {
    clearTimeout(timer); docEvents?.abort(); docEvents = null;
    frame?.removeEventListener('load', loaded); frame?.remove(); frame = null;
    entries = []; cursor = -1; pending = null;
    awaitingForm = formError = false;
    if (tools) tools.hidden = true;
    if (message) message.hidden = true;
  }
  function finish() {
    if (!readerActive) return;
    readerActive = false; cleanup();
    queueMicrotask(() => (returnFocus?.isConnected ? returnFocus : launch).focus({preventScroll:true}));
  }
  function close() { if (currentFrame()) panel.close(); }
  function loaded() {
    if (!currentFrame()) return;
    clearTimeout(timer); docEvents?.abort(); docEvents = null;
    let doc;
    try {
      doc = frame.contentDocument;
      const url = readingURL(frame.contentWindow.location.href);
      if (!doc || !url) throw new Error('Unreadable embedded destination');
      const bootstrap = doc.getElementById('homecraft-bootstrap');
      if (!bootstrap && awaitingForm) throw new Error('Native form returned an error document');
      if (bootstrap && JSON.parse(bootstrap.textContent).view.sceneEnabled) {
        frame.src = 'about:blank';
        throw new Error('Scene destinations stay outside the reader');
      }
      if (pending !== null) { cursor = pending; entries[cursor] = url.href; }
      else if (entries[cursor] !== url.href) {
        entries = entries.slice(0, cursor + 1); entries.push(url.href); cursor = entries.length - 1;
      }
      pending = null;
      awaitingForm = formError = false;
      frame.title = doc.title || heading.textContent;
      updateControls(url);
      status(bootstrap ? '' : text('当前页面未能正常显示文章，可点击 ↗ 打开。', 'This page could not display an article. Use ↗ to open it.'));
      docEvents = new AbortController();
      doc.addEventListener('submit', () => { awaitingForm = true; }, {capture:true,signal:docEvents.signal});
      doc.addEventListener('keydown', event => {
        if (event.key === 'Escape') { event.preventDefault(); close(); }
      }, {signal:docEvents.signal});
      doc.addEventListener('click', event => {
        const link = event.target.closest?.('a[href]');
        if (!link || event.defaultPrevented || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
            || link.hasAttribute('download') || link.target === '_blank') return;
        const target = new URL(link.href, url);
        if (homeURL(target)) { event.preventDefault(); close(); return; }
        const allowed = readingURL(target.href);
        // Let Typecho's native comment-reply handlers handle their own anchors.
        if (allowed && (target.pathname !== url.pathname || target.search !== url.search)) {
          event.preventDefault(); navigate(allowed);
        } else if (!allowed && ['http:', 'https:'].includes(target.protocol)) {
          event.preventDefault(); window.open(target.href, '_blank', 'noopener,noreferrer');
        }
      }, {signal:docEvents.signal});
      // Native search/comment/password forms submit in the frame unchanged.
    } catch {
      formError = awaitingForm && cursor >= 0 && doc?.location.origin === site.origin;
      awaitingForm = false;
      if (formError) {
        back.disabled = false; forward.disabled = true;
        status(text('提交未完成，可点击后退修改，或用 ↗ 打开原页面。', 'Submission did not complete. Go back to edit, or use ↗ to open the original page.'));
      } else status(text('此页面无法在窗口内显示，请点击右上角 ↗ 打开。', 'This page cannot be displayed here. Use ↗ to open it.'));
    }
  }
  function createChrome() {
    tools = document.createElement('nav'); tools.className = 'scene-browser-tools'; tools.hidden = true;
    tools.setAttribute('aria-label', text('文章浏览器导航', 'Article browser navigation'));
    const button = (name, label, glyph, action) => {
      const node = document.createElement('button'); node.type = 'button'; node.dataset.browserAction = name;
      node.textContent = glyph; node.title = label; node.setAttribute('aria-label', label);
      node.addEventListener('click', action); tools.append(node); return node;
    };
    back = button('back', text('后退', 'Back'), '←', () => {
      if (formError) {
        formError = false; pending = cursor;
        loading(new URL(entries[cursor]));
        // Native form errors need native Back so the browser can restore fields.
        frame.contentWindow.history.back();
      } else navigate(new URL(entries[cursor - 1]), cursor - 1);
    });
    forward = button('forward', text('前进', 'Forward'), '→', () => navigate(new URL(entries[cursor + 1]), cursor + 1));
    button('reload', text('刷新文章', 'Reload article'), '↻', () => navigate(new URL(address.href), cursor >= 0 ? cursor : null));
    button('list', text('文章列表', 'All posts'), '▤', () => navigate(blog));
    address = document.createElement('a'); address.className = 'scene-browser-address';
    address.target = '_blank'; address.rel = 'noopener noreferrer';
    address.setAttribute('aria-label', text('在新标签页打开当前文章', 'Open current article in a new tab'));
    tools.append(address);
    message = document.createElement('p'); message.className = 'scene-browser-status'; message.setAttribute('role', 'status'); message.hidden = true;
    // Toolbar text/space must not count as a click on the native backdrop.
    tools.addEventListener('pointerdown', event => event.stopPropagation());
    tools.addEventListener('click', event => event.stopPropagation());
    message.addEventListener('pointerdown', event => event.stopPropagation());
    message.addEventListener('click', event => event.stopPropagation());
    panel.querySelector('.body').before(tools, message);
    panel.addEventListener('close', finish);
    new MutationObserver(() => {
      if (!panel.open) finish();
      else if (panel.dataset.station !== 'reader') { readerActive = false; cleanup(); }
    }).observe(panel, {attributes:true,attributeFilter:['data-station','open']});
  }
  function open(value, trigger) {
    const url = readingURL(value);
    if (!url || !window.__home?.openPage || document.body.classList.contains('hc-fallback')) return false;
    panel = document.getElementById('panel');
    if (!panel) return false;
    if (!tools) createChrome();
    cleanup(); returnFocus = trigger;
    reader.dataset.embed = url.href;
    window.__home.openPage('reader'); // Native modal clears input and cancels movement.
    frame = panel.querySelector('.body iframe');
    if (!frame) return false;
    readerActive = true;
    tools.hidden = false; entries = []; cursor = -1; pending = null;
    frame.addEventListener('load', loaded);
    loading(url);
    return true;
  }
  launch.addEventListener('click', () => open(blog.href, launch));
  document.addEventListener('click', event => {
    const link = event.target.closest?.('#panel [data-recent-posts] a, #panel .body a.mc-button');
    if (!link || event.defaultPrevented || event.button || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey
        || link.target === '_blank' || link.hasAttribute('download')) return;
    if (open(link.href, link)) { event.preventDefault(); event.stopPropagation(); }
  }, true);
  window.addEventListener('pagehide', () => {
    if (readerActive) {
      panel.close();
      document.body.classList.remove('reading');
    }
    readerActive = false;
    cleanup();
  });
  return { disable() {
    launch.hidden = true;
    if (readerActive) panel.close();
    readerActive = false;
    cleanup();
  }, enable() {
    launch.hidden = false;
    const renderer = window.__home?.stage.renderer;
    if (renderer && !renderInstalled) {
      renderInstalled = true;
      const render = renderer.render;
      // Retain the last scene image while reading; the native modal guards input.
      // The existing loop resumes drawing on its next frame after closure.
      renderer.render = function (scene, camera) { if (!readerActive) return render.call(this, scene, camera); };
    }
  } };
}
