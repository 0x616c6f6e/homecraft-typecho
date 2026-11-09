import { showFallback } from './fallback.js';

let started = false;
export async function startScene(data) {
  if (started) return;
  started = true;
  const status = document.getElementById('scene-status');
  if (!data.view.sceneEnabled) return;
  if (new URL(location.href).searchParams.has('plain')) {
    showFallback('正在查看文字版');
    return;
  }
  // Import success does not mean asynchronous engine startup has completed.
  let finished = false;
  const startedAt = performance.now();
  const watch = setInterval(() => {
    if (window.__homeStartupError) {
      finished = true;
      clearInterval(watch);
      showFallback('3D 启动失败，可以直接阅读文章');
    } else if (window.__home?.player) {
      finished = true;
      clearInterval(watch);
      if (status) status.textContent = '3D 场景已就绪';
    } else if (performance.now() - startedAt > 30000) {
      clearInterval(watch);
      // Do not hide a still-booting engine or pretend to cancel it. Navigation
      // remains available above the loading overlay even on a slow device.
      if (status) status.textContent = '加载较慢，可以直接阅读文章';
    }
  }, 100);
  try {
    await import('../engine/main.js');
  } catch (error) {
    clearInterval(watch);
    if (!finished) showFallback('场景资源加载失败，可以直接阅读文章');
    console.error('Homecraft integration could not load:', error);
  }
}
