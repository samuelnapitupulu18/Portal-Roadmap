class AppError extends Error {
  constructor(message, statusCode, isOperational = true) {
    super(message);
    this.name = 'AppError';
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }

  static forbidden(msg = 'Forbidden') { return new AppError(msg, 403); }
  static notFound(msg = 'Resource not found') { return new AppError(msg, 404); }
}

module.exports = AppError;
