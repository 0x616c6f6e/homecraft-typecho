import { showFallback } from './fallback.js';
import { initSceneBrowser } from './scene-browser.js';

let started = false;
export async function startScene(data) {
  if (started) return;
  started = true;
  const text = (zh, en) => data.site.language.startsWith('en') ? en : zh;
  const status = document.getElementById('scene-status');
  if (!data.view.sceneEnabled) return;
  if (new URL(location.href).searchParams.has('plain')) {
    showFallback(text('正在查看文字版', 'Reading the text version'));
    return;
  }
  const browser = initSceneBrowser(data);
  window.addEventListener('homecraft:scene-failed', () => {
    browser.disable();
    showFallback(text('3D 绘图中断，可以直接阅读文章', 'Graphics interrupted. You can read the articles.'));
  }, {once:true});
  // Import success does not mean asynchronous engine startup has completed.
  let finished = false, slow = false;
  const startedAt = performance.now();
  const watch = setInterval(() => {
    if (window.__homeStartupError) {
      finished = true;
      clearInterval(watch);
      showFallback(text('3D 启动失败，可以直接阅读文章', '3D could not start. You can read the articles.'));
    } else if (window.__home?.player) {
      finished = true;
      clearInterval(watch);
      if (status) status.textContent = text('3D 场景已就绪', '3D world ready');
      browser.enable();
    } else if (!slow && performance.now() - startedAt > 30000) {
      slow = true;
      // Do not hide a still-booting engine or pretend to cancel it. Navigation
      // remains available above the loading overlay even on a slow device.
      if (status) status.textContent = text('加载较慢，可以直接阅读文章', 'Loading is slow. You can read the articles.');
    }
  }, 100);
  try {
    await import('../engine/main.js');
  } catch (error) {
    clearInterval(watch);
    if (!finished) showFallback(text('场景资源加载失败，可以直接阅读文章', 'Scene resources could not load. You can read the articles.'));
    console.error('Homecraft integration could not load:', error);
  }
}
