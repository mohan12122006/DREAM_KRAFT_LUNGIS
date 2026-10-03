import { fail } from '../utils/respond.js';

export function notFound(req, res) {
  return fail(res, `Route ${req.originalUrl} not found`, 404);
}

// eslint-disable-next-line no-unused-vars
export function errorHandler(error, req, res, next) {
  const status = error.status || 500;
  if (status >= 500) console.error(error);
  const message = status >= 500 && process.env.NODE_ENV === 'production' ? 'Internal server error' : error.message || 'Internal server error';
  return fail(res, message, status);
}
