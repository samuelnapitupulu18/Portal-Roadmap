/**
 * @module middleware
 * @description All Express middleware in one file.
 *
 * Exports:
 *   - ipWhitelist  — IP address guard (applied per-route group)
 *   - notFound     — 404 handler for unmatched routes
 *   - errorHandler — Global error catcher (must be last)
 */

const { config, MESSAGES } = require('./config');
const logger = require('./lib/Logger');
const AppError = require('./lib/AppError');

// ──────────────────────────────────────────────
// IP Whitelist Guard
// ──────────────────────────────────────────────

function ipWhitelist(req, _res, next) {
  const clientIp = _extractIp(req);

  if (!_isAllowed(clientIp)) {
    logger.warn(`Blocked IP: ${clientIp}`, 'IpWhitelist');
    throw AppError.forbidden(MESSAGES.IP_DENIED(clientIp));
  }

  next();
}

function _extractIp(req) {
  const fwd = req.headers['x-forwarded-for'];
  if (fwd) return (Array.isArray(fwd) ? fwd[0] : fwd.split(',')[0]).trim();
  return req.ip || req.socket?.remoteAddress || 'unknown';
}

function _isAllowed(clientIp) {
  const normalized = clientIp.replace(/^::ffff:/, '');
  return config.ipWhitelist.some((rule) => {
    if (rule.includes('/')) return _cidrMatch(normalized, rule);
    return normalized === rule || clientIp === rule;
  });
}

function _cidrMatch(ip, cidr) {
  try {
    const [range, bits] = cidr.split('/');
    const mask = ~(2 ** (32 - parseInt(bits, 10)) - 1);
    const ipNum = _ipToNum(ip);
    const rangeNum = _ipToNum(range);
    if (ipNum === null || rangeNum === null) return false;
    return (ipNum & mask) === (rangeNum & mask);
  } catch { return false; }
}

function _ipToNum(ip) {
  const p = ip.split('.');
  if (p.length !== 4) return null;
  return p.reduce((acc, o) => {
    const n = parseInt(o, 10);
    return isNaN(n) || n < 0 || n > 255 ? null : (acc << 8) + n;
  }, 0);
}

// ──────────────────────────────────────────────
// 404 Not Found Handler
// ──────────────────────────────────────────────

function notFound(req) {
  throw AppError.notFound(MESSAGES.ROUTE_NOT_FOUND(req.method, req.originalUrl));
}

// ──────────────────────────────────────────────
// Global Error Handler (must have 4 params)
// ──────────────────────────────────────────────

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

module.exports = { ipWhitelist, notFound, errorHandler };
