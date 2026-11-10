/** Extend the pinned starter through its supported build hook. */
import { build as buildStarter } from '../world/build.js';
import { buildVillage } from './village.js';

export function build(context) {
  const starter = buildStarter(context);
  const village = buildVillage(context.grid);
  return {
    ...starter,
    sites: [...(starter.sites || []), village.roofs],
    named: { ...(starter.named || {}), village: { buildings: village.buildings } },
  };
}
