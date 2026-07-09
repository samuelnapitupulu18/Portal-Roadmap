/**
 * @module lib/Logger
 * @description Structured logger with level control, timestamps, and context tags.
 *
 * Levels: error(0) → warn(1) → info(2) → debug(3)
 * Debug is suppressed in production.
 *
 * Usage:
 *   const logger = require('./lib/Logger');
 *   logger.info('Server started', 'Bootstrap');
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

const COLOR = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
  reset: '\x1b[0m',
};

const threshold = process.env.NODE_ENV === 'production' ? LEVELS.info : LEVELS.debug;

function format(level, message, context = 'App') {
  const ts = new Date().toISOString();
  const tag = level.toUpperCase().padEnd(5);
  return `${COLOR[level]}[${ts}] [${tag}] [${context}]${COLOR.reset} ${message}`;
}

const logger = {
  info(msg, ctx)          { if (threshold >= LEVELS.info)  console.log(format('info', msg, ctx)); },
  warn(msg, ctx)          { if (threshold >= LEVELS.warn)  console.warn(format('warn', msg, ctx)); },
  error(msg, ctx, stack)  { if (threshold >= LEVELS.error) { console.error(format('error', msg, ctx)); if (stack) console.error(stack); } },
  debug(msg, ctx)         { if (threshold >= LEVELS.debug) console.log(format('debug', msg, ctx)); },
};

module.exports = logger;
