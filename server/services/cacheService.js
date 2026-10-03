const cache = new Map();

export function getCached(key) {
  const item = cache.get(key);
  if (!item || item.expiresAt < Date.now()) return null;
  return item.value;
}

export function setCached(key, value, ttlMs = 60000) {
  cache.set(key, { value, expiresAt: Date.now() + ttlMs });
}
