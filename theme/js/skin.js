/** Validate dimensions in the visitor's browser; never fetch image URLs on PHP. */
export function validSkin(url) {
  if (!url) return Promise.resolve('');
  return new Promise(resolve => {
    const image = new Image();
    let settled = false;
    const finish = value => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      image.onload = image.onerror = null;
      resolve(value);
    };
    const timeout = setTimeout(() => finish(''), 5000);
    image.crossOrigin = 'anonymous';
    image.onload = () => finish(image.naturalWidth === 64 && image.naturalHeight === 64 ? url : '');
    image.onerror = () => finish('');
    image.src = url;
  });
}
