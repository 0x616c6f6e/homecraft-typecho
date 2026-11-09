import { readBootstrap } from './bootstrap.js';
const { scene } = readBootstrap();
// Explicit projection: PHP does not supply executable module source.
export default {
  name: scene.name,
  skin: scene.skin,
  languages: scene.languages,
  weather: scene.weather,
  dock: scene.dock,
  mailbox: scene.mailbox,
  badge: scene.badge,
  // Phase 1 is an isolated local proof of concept, not a directory listing.
  portal: { directory: [] },
};
