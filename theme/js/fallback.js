export function showFallback(message) {
  document.body.classList.add('hc-fallback', 'plain');
  document.getElementById('loading')?.remove();
  const status = document.getElementById('scene-status');
  if (status) status.textContent = message;
}
