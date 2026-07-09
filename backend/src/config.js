/**
 * @module config
 * @description Centralized configuration + application constants.
 * Validates environment at startup (fail-fast).
 */

const dotenv = require('dotenv');
const logger = require('./lib/Logger');

dotenv.config();

// ──────────────────────────────────────────────
// Constants
// ──────────────────────────────────────────────

const STORY_STATUS = Object.freeze({
  PLANNED: 'Planned',
  IN_PROGRESS: 'In Progress',
  TESTING: 'Testing',
  DONE: 'Released / Done',
});

const MESSAGES = Object.freeze({
  STORIES_OK: 'Stories retrieved successfully',
  STORY_DETAIL_OK: 'Story detail retrieved successfully',
  STORY_NOT_FOUND: (id) => `Story with ID "${id}" not found`,
  ROUTE_NOT_FOUND: (method, url) => `Cannot ${method} ${url}`,
  IP_DENIED: (ip) => `Access denied. IP ${ip} not allowed.`,
});

const CACHE_KEYS = Object.freeze({
  ALL_STORIES: (month) => `roadmap:stories:${month || 'all'}`,
});

const APP_NAME = 'portal-nusa-backend';

// ──────────────────────────────────────────────
// Environment Config
// ──────────────────────────────────────────────

function parseList(value, fallback) {
  return (value || fallback).split(',').map((s) => s.trim());
}

const config = Object.freeze({
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiPrefix: process.env.API_PREFIX || 'api/v1',

  jira: Object.freeze({
    baseUrl: process.env.JIRA_BASE_URL || '',
    apiEmail: process.env.JIRA_API_EMAIL || '',
    apiToken: process.env.JIRA_API_TOKEN || '',
  }),

  cacheTtlSeconds: parseInt(process.env.CACHE_TTL_SECONDS || '300', 10),
  corsAllowedOrigins: parseList(process.env.CORS_ALLOWED_ORIGINS, 'http://localhost:5173'),
  ipWhitelist: parseList(process.env.ALLOWED_IP_WHITELIST, '127.0.0.1,::1'),
});

// ──────────────────────────────────────────────
// Validation (Fail-Fast)
// ──────────────────────────────────────────────

(function validate() {
  const errors = [];
  if (isNaN(config.port) || config.port < 1 || config.port > 65535)
    errors.push(`PORT must be 1-65535, got "${process.env.PORT}"`);
  if (isNaN(config.cacheTtlSeconds) || config.cacheTtlSeconds < 0)
    errors.push(`CACHE_TTL_SECONDS must be >= 0, got "${process.env.CACHE_TTL_SECONDS}"`);
  if (config.corsAllowedOrigins.length === 0)
    errors.push('CORS_ALLOWED_ORIGINS must have at least one origin');
  if (config.ipWhitelist.length === 0)
    errors.push('ALLOWED_IP_WHITELIST must have at least one IP');

  if (errors.length) {
    errors.forEach((e) => logger.error(e, 'Config'));
    throw new Error(`Invalid configuration: ${errors.length} error(s)`);
  }
  logger.debug('Configuration validated', 'Config');
})();

module.exports = { config, STORY_STATUS, MESSAGES, CACHE_KEYS, APP_NAME };
