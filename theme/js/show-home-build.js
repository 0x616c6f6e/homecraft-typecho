/** The MIT example architecture, with its desk hotspot mapped to the blog card. */
import { build as buildExample } from '../world/show-home/build.js';
export { setup } from '../world/show-home/build.js';
export function build(context) {
  const world = buildExample(context);
  return { ...world, hotspots: world.hotspots.map(h => h.id === 'works' ? { ...h, id: 'blog' } : h) };
}
