/**
 * @module server
 * @description Application entry point.
 * Express setup + middleware pipeline + listen + graceful shutdown.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { config, APP_NAME } = require('./config');
const routes = require('./routes');
const { notFound, errorHandler } = require('./middleware');
const logger = require('./lib/Logger');

// ──────────────────────────────────────────────
// Express App
// ──────────────────────────────────────────────

const app = express();

// 1. Security
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: config.corsAllowedOrigins, methods: ['GET'], credentials: false }));

// 2. Parsing & Logging
app.use(express.json());
app.use(morgan('short'));

// 3. Routes
app.use(`/${config.apiPrefix}`, routes);

// 4. Error handling (must be last)
app.use(notFound);
app.use(errorHandler);

// ──────────────────────────────────────────────
// Start Server
// ──────────────────────────────────────────────

const { port, apiPrefix, nodeEnv, corsAllowedOrigins, ipWhitelist } = config;

const server = app.listen(port, () => {
  logger.info(`${APP_NAME} started`, 'Bootstrap');
  logger.info(`Environment : ${nodeEnv}`, 'Bootstrap');
  logger.info(`Server      : http://localhost:${port}/${apiPrefix}`, 'Bootstrap');
  logger.info(`Health      : http://localhost:${port}/${apiPrefix}/health`, 'Bootstrap');
  logger.info(`CORS Origins: ${corsAllowedOrigins.join(', ')}`, 'Bootstrap');
  logger.info(`IP Whitelist: ${ipWhitelist.join(', ')}`, 'Bootstrap');
});

// ──────────────────────────────────────────────
// Graceful Shutdown
// ──────────────────────────────────────────────

function shutdown(signal) {
  logger.warn(`${signal} received — shutting down...`, 'Bootstrap');
  server.close(() => {
    logger.info('All connections closed. Exiting.', 'Bootstrap');
    process.exit(0);
  });
  setTimeout(() => { logger.error('Forced shutdown.', 'Bootstrap'); process.exit(1); }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('unhandledRejection', (reason) => logger.error(`Unhandled Rejection: ${reason}`, 'Process'));
process.on('uncaughtException', (err) => { logger.error(`Uncaught Exception: ${err.message}`, 'Process', err.stack); process.exit(1); });
