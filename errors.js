'use strict';

class HttpError extends Error {
  constructor(code = 500, message = 'Internal server error', ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, HttpError);
    }

    this.message = message;
    this.code = code;
  }
}

class NotFoundError extends HttpError {
  constructor(...params) {
    super(404, 'Not found', ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }
  }
}

class ValidationError extends HttpError {
  constructor(location, message, code = 400, ...params) {
    super(code, message, ...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }

    this.location = location;
    this.reason = 'ValidationError';
  }
}

module.exports = {
  HttpError,
  NotFoundError,
  ValidationError,
};
