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

module.exports = {
  HttpError,
  NotFoundError,
};
