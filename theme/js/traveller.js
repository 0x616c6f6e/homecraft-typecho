/** Typecho owns this site's identity; keep upstream travel/session behavior. */
import { config } from '../engine/config.js';
import { createTravelSession } from '../engine/door-protocol.js';
import { readBootstrap } from './bootstrap.js';

export const traveller = createTravelSession(
  config.skin,
  '',
  async () => readBootstrap().site.title,
);
export const wornSkin = () => traveller.wornSkin();
