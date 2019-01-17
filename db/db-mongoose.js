'use strict';

const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

const { DATABASE_URL, MONGO_OPTIONS } = require('../config');

function dbConnect(url = DATABASE_URL, connectionOptions = MONGO_OPTIONS) {
  return mongoose
    .connect(
      url,
      connectionOptions
    )
    .catch(err => {
      /* eslint-disable no-console */
      console.error('Mongoose failed to connect');
      console.error(err);
      /* eslint-enable no-console */
    });
}

function dbDisconnect() {
  return mongoose.disconnect();
}

function dbGet() {
  return mongoose;
}

module.exports = {
  dbConnect,
  dbDisconnect,
  dbGet,
};
