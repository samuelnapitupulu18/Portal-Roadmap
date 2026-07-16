const { config, MESSAGES } = require('./config');
const logger = require('./lib/Logger');
const AppError = require('./lib/AppError');

function apiKeyGuard(req, _res, next) {
  if (!config.apiKey) return next();

  const provided = req.headers['x-api-key'] || req.query.api_key;
  if (provided !== config.apiKey) {
    logger.warn(`Invalid API key from ${req.ip}`, 'ApiKeyGuard');
    throw AppError.forbidden(MESSAGES.API_KEY_DENIED);
  }

  next();
}

function notFound(req) {
  throw AppError.notFound(MESSAGES.ROUTE_NOT_FOUND(req.method, req.originalUrl));
}

function errorHandler(err, req, res, _next) {
  const statusCode = err instanceof AppError ? err.statusCode : 500;
  const message = err instanceof AppError ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error(`${req.method} ${req.url} → ${statusCode}: ${err.message}`, 'Error', err.stack);
  } else {
    logger.warn(`${req.method} ${req.url} → ${statusCode}: ${message}`, 'Error');
  }

  res.status(statusCode).json({
    statusCode,
    message,
    timestamp: new Date().toISOString(),
    path: req.originalUrl,
  });
}

module.exports = { apiKeyGuard, notFound, errorHandler };
