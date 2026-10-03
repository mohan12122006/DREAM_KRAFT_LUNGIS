import { pool, query } from '../config/database.js';

// Every repository checks this at call time (not at import time) so the app
// can boot without DATABASE_URL and fall back to the in-memory demo store,
// while still using PostgreSQL automatically the moment it is configured.
export const usingDatabase = () => Boolean(pool);
export { query };
// node-pg returns BIGINT/BIGSERIAL columns as strings (they exceed the safe
// JS integer range in theory); this app's ids stay well within Number.MAX_SAFE_INTEGER,
// so every repo coerces them back to numbers to match the in-memory demo shape
// and avoid strict-equality bugs on the client (e.g. wishlist/cart lookups).
export const num = value => (value === null || value === undefined ? value : Number(value));
