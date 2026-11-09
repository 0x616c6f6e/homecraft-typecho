/** Public data boundary shared by the scene and reading entry points. */
const VIEW_KINDS = new Set(['home', 'post', 'page', 'archive', 'search', 'notFound']);
const object = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const string = value => typeof value === 'string';
const positiveInteger = value => Number.isSafeInteger(value) && value > 0;
function webURL(value) {
  if (!string(value)) return false;
  try {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && !url.username && !url.password;
  } catch { return false; }
}

export function validateBootstrap(data) {
  const invalid = () => { throw new Error('Invalid Homecraft bootstrap contract v1'); };
  if (!object(data) || data.schemaVersion !== 1) invalid();
  if (!object(data.view) || !VIEW_KINDS.has(data.view.kind)
    || typeof data.view.sceneEnabled !== 'boolean'
    || (data.view.sceneEnabled && data.view.kind !== 'home')) invalid();
  if (!object(data.site) || !string(data.site.title) || !string(data.site.description)
    || !string(data.site.language) || !webURL(data.site.url)) invalid();
  if (!object(data.urls) || !['home', 'blog', 'feed', 'themeBase'].every(key => webURL(data.urls[key]))
    || !data.urls.themeBase.endsWith('/')) invalid();
  if (data.profile !== undefined && (!object(data.profile)
    || !['name','introduction','logo','favicon'].every(key => string(data.profile[key]))
    || !['logo','favicon'].every(key => data.profile[key] === '' || webURL(data.profile[key]))
    || !Array.isArray(data.profile.links) || !data.profile.links.every(link => object(link)
      && ['github','blog','x'].includes(link.id) && string(link.name) && webURL(link.url)))) invalid();
  if (data.pages !== undefined && (!object(data.pages)
    || !['about','guestbook'].every(key => data.pages[key] === null
      || (object(data.pages[key]) && string(data.pages[key].title) && webURL(data.pages[key].url))))) invalid();
  const scene = data.scene;
  if (!object(scene) || !string(scene.name) || !string(scene.skin)
    || (scene.skin !== '' && !webURL(scene.skin))
    || !Array.isArray(scene.languages) || scene.languages.length === 0
    || !scene.languages.every(lang => ['zh', 'en'].includes(lang))
    || !Array.isArray(scene.dock) || scene.dock.length > 9
    || !scene.dock.every(id => string(id) && /^[a-z][a-z0-9-]*$/.test(id))
    || typeof scene.badge !== 'boolean') invalid();
  if (!object(scene.mailbox) || !['endpoint', 'email', 'turnstileSitekey'].every(key => string(scene.mailbox[key]))
    || (scene.mailbox.endpoint !== '' && !webURL(scene.mailbox.endpoint))) invalid();
  if (scene.weather !== null && (!object(scene.weather)
    || !string(scene.weather.city) || !string(scene.weather.cityEn) || !string(scene.weather.timezone)
    || !Number.isFinite(scene.weather.latitude) || Math.abs(scene.weather.latitude) > 90
    || !Number.isFinite(scene.weather.longitude) || Math.abs(scene.weather.longitude) > 180)) invalid();
  if (!Array.isArray(data.posts) || !data.posts.every(post => object(post)
    && positiveInteger(post.id) && string(post.title) && string(post.excerpt)
    && webURL(post.url) && string(post.publishedAt) && Number.isFinite(Date.parse(post.publishedAt)))) invalid();
  const pagination = data.pagination;
  if (pagination !== null && (!object(pagination) || !positiveInteger(pagination.currentPage)
    || !Number.isSafeInteger(pagination.totalPages) || pagination.totalPages < 0
    || !['previousUrl', 'nextUrl'].every(key => pagination[key] === null || webURL(pagination[key])))) invalid();
  return data;
}

export function readBootstrap() {
  const element = document.getElementById('homecraft-bootstrap');
  if (!element) throw new Error('Missing Homecraft bootstrap data');
  return validateBootstrap(JSON.parse(element.textContent));
}
