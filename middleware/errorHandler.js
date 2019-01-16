'use strict';
const { HttpError, NotFoundError, ValidationError } = require('../errors');

function notFoundHandler(req, res, next) {
  next(new NotFoundError());
}

// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  if (!(err instanceof HttpError)) {
    if (process.env.NODE_ENV !== 'test') {
      // eslint-disable-next-line no-console
      console.error(err);
    }
    res.status(500).json({
      code: 500,
      message: 'Internal server error',
    });

    return;
  }

  const { code, message } = err;
  const error = { code, message };

  if (err instanceof ValidationError) {
    const { reason, location } = err;
    Object.assign(error, { reason, location });
  }

  res.status(code).json(error);
}

module.exports = [notFoundHandler, errorHandler];
