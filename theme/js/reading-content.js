/** Small progressive enhancements; content and native form submission work without modules. */
export function initReadingContent(english) {
  const text = (zh, en) => english ? en : zh;
  for (const table of document.querySelectorAll('.content table, .comment-content table')) {
    if (table.parentElement.classList.contains('table-scroll')) continue;
    const region = document.createElement('div');
    region.className = 'table-scroll';
    region.tabIndex = 0;
    region.setAttribute('role', 'region');
    region.setAttribute('aria-label', text('表格，可横向滚动', 'Table, scroll horizontally'));
    table.before(region);
    region.append(table);
  }
  for (const pre of document.querySelectorAll('.content pre')) {
    pre.tabIndex = 0;
    if (!navigator.clipboard?.writeText) continue;
    const code = pre.querySelector('code') || pre;
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'copy-code';
    button.textContent = text('复制代码', 'Copy code');
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = text('已复制', 'Copied');
      } catch { button.textContent = text('请选中代码手动复制', 'Select code to copy manually'); }
    });
    // Keep the button outside code text and its horizontal scrolling region.
    pre.before(button);
  }
  const form = document.getElementById('comment-form');
  if (!form) return;
  const status = form.querySelector('[role=status]');
  let submitting = false;
  const reset = () => {
    submitting = false;
    form.removeAttribute('aria-busy');
    form.querySelector('button[type=submit]').disabled = false;
    status.textContent = '';
  };
  form.addEventListener('submit', event => {
    if (submitting) { event.preventDefault(); return; }
    submitting = true;
    form.setAttribute('aria-busy', 'true');
    form.querySelector('button[type=submit]').disabled = true;
    status.textContent = text('正在提交…', 'Submitting…');
  });
  // Native validation errors navigate away; browser Back must leave the form usable.
  window.addEventListener('pageshow', reset);
  document.addEventListener('click', event => {
    if (event.target.closest('#cancel-comment-reply-link')) {
      queueMicrotask(() => form.querySelector('textarea').focus());
    }
  });
}
