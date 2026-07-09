/**
 * @module services/CacheService
 * @description In-memory cache with TTL expiration.
 */

const { config } = require('../config');
const logger = require('../lib/Logger');

const CTX = 'Cache';

class CacheService {
  constructor() {
    this._store = new Map();
    this._ttlMs = config.cacheTtlSeconds * 1000;
  }

  get(key) {
    const entry = this._store.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this._store.delete(key);
      logger.debug(`MISS (expired): ${key}`, CTX);
      return null;
    }

    logger.debug(`HIT: ${key}`, CTX);
    return entry.data;
  }

  set(key, data) {
    this._store.set(key, { data, expiresAt: Date.now() + this._ttlMs });
    logger.debug(`SET: ${key} (TTL: ${config.cacheTtlSeconds}s)`, CTX);
  }

  clear() {
    this._store.clear();
    logger.info('Cache cleared', CTX);
  }
}

module.exports = new CacheService();
