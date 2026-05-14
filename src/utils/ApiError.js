const { ErrorCode } = require('../enums/ApiErrorCode');

class ApiError extends Error {
  constructor(statusCode, payload, isOperational = true, stack = '') {
    const code = ErrorCode[payload] ? ErrorCode[payload].code : '500';
    const description = ErrorCode[payload] ? ErrorCode[payload].description : 'Internal Server Error';

    super(code);

    this.statusCode = statusCode;
    this.code = code;
    this.description = description;
    this.isOperational = isOperational;

    if (stack) {
      this.stack = stack;
    } else {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

module.exports = ApiError;
