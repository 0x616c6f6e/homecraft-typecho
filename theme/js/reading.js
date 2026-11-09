import { initReadingContent } from './reading-content.js';
/** Progressive navigation enhancement; no scene imports or client-side router. */
export function initReading(data) {
  const current = new URL(location.href);
  for (const link of document.querySelectorAll('.site-header nav a')) {
    const target = new URL(link.href);
    const selected = target.origin === current.origin
      && target.pathname === current.pathname && target.search === current.search;
    if (selected) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  }
  // Enhance page-position text without replacing native links or filtering results.
  const status = document.querySelector('[data-page-position]');
  if (status && data.pagination) {
    status.textContent = data.site.language.startsWith('en')
      ? `Page ${data.pagination.currentPage} of ${data.pagination.totalPages}`
      : `第 ${data.pagination.currentPage} 页，共 ${data.pagination.totalPages} 页`;
  }
  initReadingContent(data.site.language.startsWith('en'));
  document.body.dataset.readingView = data.view.kind;
}
