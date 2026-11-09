import { readBootstrap } from './bootstrap.js';
import { initContent } from './content.js';
import { showFallback } from './fallback.js';

async function start() {
  const data = readBootstrap();
  document.documentElement.dataset.view = data.view.kind;
  initContent(data);
  if (data.view.sceneEnabled) {
    const { startScene } = await import('./scene.js');
    await startScene(data);
  } else {
    const { initReading } = await import('./reading.js');
    initReading(data);
  }
  document.documentElement.dataset.enhanced = 'true';
}

start().catch(error => {
  // Server-rendered links/content remain available even with invalid config.
  if (document.getElementById('world')) showFallback('配置加载失败，可以直接阅读文章');
  console.error('Homecraft integration could not start:', error);
});
