import {
  num,
  query,
  usingDatabase
} from './db.js';

const mapRow = row =>
  row && {
    id: num(row.id),
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    phone: row.phone,
    role: row.role,
    createdAt: row.created_at
  };

function requireDatabase() {
  if (!usingDatabase()) {
    throw new Error(
      'PostgreSQL is not configured. Check server/.env DATABASE_URL.'
    );
  }
}

/*
|--------------------------------------------------------------------------
| Find User By Email
|--------------------------------------------------------------------------
*/

export async function findByEmail(email) {
  requireDatabase();

  const normalized = String(email || '')
    .trim()
    .toLowerCase();

  const { rows } = await query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        role,
        created_at
      FROM users
      WHERE LOWER(email) = $1
      LIMIT 1
    `,
    [normalized]
  );

  return mapRow(rows[0]) || null;
}

/*
|--------------------------------------------------------------------------
| Find User By ID
|--------------------------------------------------------------------------
*/

export async function findById(id) {
  requireDatabase();

  const { rows } = await query(
    `
      SELECT
        id,
        name,
        email,
        password_hash,
        phone,
        role,
        created_at
      FROM users
      WHERE id = $1
      LIMIT 1
    `,
    [id]
  );

  return mapRow(rows[0]) || null;
}

/*
|--------------------------------------------------------------------------
| Create User
|--------------------------------------------------------------------------
*/

export async function create({
  name,
  email,
  phone,
  passwordHash
}) {
  requireDatabase();

  const { rows } = await query(
    `
      INSERT INTO users (
        name,
        email,
        phone,
        password_hash,
        role
      )
      VALUES ($1, $2, $3, $4, 'customer')
      RETURNING
        id,
        name,
        email,
        password_hash,
        phone,
        role,
        created_at
    `,
    [
      name,
      email,
      phone || null,
      passwordHash
    ]
  );

  return mapRow(rows[0]);
}

/*
|--------------------------------------------------------------------------
| Update Password
|--------------------------------------------------------------------------
*/

export async function updatePassword(
  userId,
  passwordHash
) {
  requireDatabase();

  const { rows } = await query(
    `
      UPDATE users
      SET
        password_hash = $1,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      RETURNING
        id,
        name,
        email,
        password_hash,
        phone,
        role,
        created_at
    `,
    [
      passwordHash,
      userId
    ]
  );

  return mapRow(rows[0]) || null;
}