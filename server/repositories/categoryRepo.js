import { categories } from '../data.js';
import { num, query, usingDatabase } from './db.js';

const mapRow = row => row && ({
  id: num(row.id),
  name: row.name,
  slug: row.slug,
  description: row.description,
  imageUrl: row.image_url
});

export async function list() {
  if (!usingDatabase()) return categories;
  const { rows } = await query('SELECT * FROM categories ORDER BY id');
  return rows.map(mapRow);
}

export async function getBySlug(slug) {
  if (!usingDatabase()) return categories.find(item => item.slug === slug) || null;
  const { rows } = await query('SELECT * FROM categories WHERE slug = $1', [slug]);
  return mapRow(rows[0]) || null;
}
