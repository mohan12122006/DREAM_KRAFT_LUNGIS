// Must run before any other import: modules like config/database.js read
// process.env at import time, so dotenv has to be loaded first.
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Don't let one bad async error take the process down silently in production.
process.on('unhandledRejection', reason => console.error('Unhandled rejection:', reason));
process.on('uncaughtException', error => console.error('Uncaught exception:', error));

const shutdown = signal => {
  console.log(`${signal} received, shutting down gracefully`);
  server.close(() => process.exit(0));
  setTimeout(() => process.exit(1), 10000).unref();
};
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
