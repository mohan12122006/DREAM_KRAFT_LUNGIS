import { newsletterSubscribers } from '../data.js';
import { query, usingDatabase } from './db.js';

export async function isSubscribed(email) {
  if (!usingDatabase()) return newsletterSubscribers.some(item => item.email === email);
  const { rows } = await query('SELECT 1 FROM newsletter_subscribers WHERE email = $1 AND is_active = TRUE', [email]);
  return rows.length > 0;
}

export async function subscribe(email) {
  if (!usingDatabase()) {
    newsletterSubscribers.push({ id: newsletterSubscribers.length + 1, email, isActive: true, subscribedAt: new Date().toISOString(), unsubscribedAt: null });
    return;
  }
  await query(
    `INSERT INTO newsletter_subscribers (email) VALUES ($1)
     ON CONFLICT (email) DO UPDATE SET is_active = TRUE, subscribed_at = NOW(), unsubscribed_at = NULL`,
    [email]
  );
}
