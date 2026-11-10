/** Preserve the example geometry while mapping the desk to native blog content. */
import * as original from '../world/show-home/layout.js';
import { readBootstrap } from './bootstrap.js';
export * from '../world/show-home/layout.js';
const hasGuestbook = Boolean(readBootstrap().pages?.guestbook);
export const STATIONS = original.STATIONS
  .filter(s => s.id !== 'mailbox' || hasGuestbook)
  .map(s => s.id === 'works' ? { ...s, id: 'blog', name: '工作台 · 文章', en: 'Desk · Posts', icon: 'blog' }
    : s.id === 'mailbox' ? { ...s, name: '留言', en: 'Guestbook' } : s);
export const MAILBOX = hasGuestbook ? original.MAILBOX : null;
