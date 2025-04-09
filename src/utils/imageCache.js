const CACHE_NAME = 'yugioh-card-images';
const CACHE_VERSION = 'v1';

// Initialize the cache
export const initImageCache = async () => {
  try {
    const cache = await caches.open(`${CACHE_NAME}-${CACHE_VERSION}`);
    return cache;
  } catch (error) {
    console.error('Failed to initialize image cache:', error);
    return null;
  }
};

// Get image from cache or fetch and cache it
export const getCachedImage = async (imageUrl) => {
  try {
    const cache = await caches.open(`${CACHE_NAME}-${CACHE_VERSION}`);
    const cachedResponse = await cache.match(imageUrl);

    if (cachedResponse) {
      return cachedResponse;
    }

    // If not in cache, fetch and store
    const response = await fetch(imageUrl);
    if (response.ok) {
      await cache.put(imageUrl, response.clone());
    }
    return response;
  } catch (error) {
    console.error('Error in getCachedImage:', error);
    // Fallback to direct fetch if cache fails
    return fetch(imageUrl);
  }
};

// Pre-cache specific images
export const preCacheImages = async (imageUrls) => {
  try {
    const cache = await caches.open(`${CACHE_NAME}-${CACHE_VERSION}`);
    await Promise.all(
      imageUrls.map(async (url) => {
        const response = await fetch(url);
        if (response.ok) {
          await cache.put(url, response);
        }
      })
    );
  } catch (error) {
    console.error('Error pre-caching images:', error);
  }
};

// Clear old cache versions
export const clearOldCache = async () => {
  try {
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(key => key.startsWith(CACHE_NAME) && key !== `${CACHE_NAME}-${CACHE_VERSION}`)
        .map(key => caches.delete(key))
    );
  } catch (error) {
    console.error('Error clearing old cache:', error);
  }
}; 