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
  document.body.dataset.readingView = data.view.kind;
}
