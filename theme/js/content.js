/** Enhance public summaries using DOM text nodes; no HTML from JSON is executed. */
export function initContent(data) {
  for (const root of document.querySelectorAll('[data-recent-posts]')) {
    if (!data.posts.length) continue; // Keep the server's useful empty state.
    const list = document.createElement('ol');
    for (const post of data.posts) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = post.url;
      link.textContent = post.title;
      const date = document.createElement('time');
      date.dateTime = post.publishedAt;
      date.textContent = new Intl.DateTimeFormat(data.site.language, { dateStyle: 'medium' }).format(new Date(post.publishedAt));
      const excerpt = document.createElement('p');
      excerpt.textContent = post.excerpt;
      item.append(link, date, excerpt);
      list.append(item);
    }
    root.replaceChildren(list);
  }
}
