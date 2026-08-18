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

  // Ambil entry apa adanya, termasuk yang sudah lewat TTL. Dipakai untuk
  // stale-while-revalidate: menyajikan data basi jauh lebih baik daripada
  // membuat user menunggu satu putaran penuh fetch Jira.
  getStale(key) {
    const entry = this._store.get(key);
    if (!entry) return null;

    const isStale = Date.now() > entry.expiresAt;
    logger.debug(`${isStale ? 'STALE' : 'HIT'}: ${key}`, CTX);
    return { data: entry.data, isStale };
  }

  set(key, data) {
    this._store.set(key, { data, expiresAt: Date.now() + this._ttlMs });
    logger.debug(`SET: ${key} (TTL: ${config.cacheTtlSeconds}s)`, CTX);
  }
}

module.exports = new CacheService();
