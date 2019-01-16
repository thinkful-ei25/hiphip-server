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
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, NotFoundError);
    }

    this.message = 'Not found';
    this.code = 404;
  }
}

class ValidationError extends HttpError {
  constructor(location, message, code = 400, ...params) {
    super(...params);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ValidationError);
    }

    this.message = message;
    this.location = location;
    this.code = code;
    this.reason = 'ValidationError';
  }
}

module.exports = {
  HttpError,
  NotFoundError,
  ValidationError,
};
