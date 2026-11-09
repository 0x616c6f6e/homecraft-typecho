/** Adapt optional native-page entry points without modifying the upstream world. */
import * as original from '../world/layout.js';
import { readBootstrap } from './bootstrap.js';
export * from '../world/layout.js';
const hasGuestbook = Boolean(readBootstrap().pages?.guestbook);
export const STATIONS = original.STATIONS
  .filter(station => station.id !== 'mailbox' || hasGuestbook)
  .map(station => station.id === 'mailbox' ? { ...station, name: '留言', en: 'Guestbook' } : station);
export const MAILBOX = hasGuestbook ? original.MAILBOX : null;
