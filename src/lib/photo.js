// Sizes made by scripts/photos.mjs. Spread onto an <img>: <img {...photo("room-king")} sizes="100vw" />
export const photo = (name) => ({
  src: `/photos/${name}-960.webp`,
  srcSet: `/photos/${name}-960.webp 960w, /photos/${name}-1920.webp 1920w`,
});
