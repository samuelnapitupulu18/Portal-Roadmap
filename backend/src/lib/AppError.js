/**
 * @module lib/AppError
 * @description Custom application error with HTTP semantics.
 *
 * Usage:
 *   throw AppError.notFound('Story not found');
 *   throw AppError.forbidden('IP not allowed');
 */

class AppError extends Error {
  /**
   * @param {string} message - Human-readable error message.
   * @param {number} statusCode - HTTP status code.
   * @param {boolean} [isOperational=true] - Whether this is an expected error.
   */
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static badRequest(msg = 'Bad request') { return new AppError(msg, 400); }
  static forbidden(msg = 'Forbidden') { return new AppError(msg, 403); }
  static notFound(msg = 'Resource not found') { return new AppError(msg, 404); }
  static internal(msg = 'Internal server error') { return new AppError(msg, 500, false); }
}

module.exports = AppError;
