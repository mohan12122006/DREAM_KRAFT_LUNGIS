import pg from 'pg';

export const pool = process.env.DATABASE_URL
  ? new pg.Pool({ connectionString: process.env.DATABASE_URL, ssl: process.env.PGSSL === 'true' ? { rejectUnauthorized: false } : false })
  : null;

export async function query(text, params) {
  if (!pool) throw new Error('DATABASE_URL is not configured. The demo API is using in-memory repositories.');
  return pool.query(text, params);
}
