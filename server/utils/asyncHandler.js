// Express 4 does not forward rejected promises from async route handlers to
// the error middleware. Wrapping every controller closes that gap so a
// thrown/rejected error always becomes a clean JSON error response instead
// of an unhandled rejection or a hung request.
export const asyncHandler = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
