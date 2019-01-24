'use strict';

require('dotenv').config();

module.exports = {
  PORT: process.env.PORT || 8080,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:3000',
  DATABASE_URL:
    process.env.DATABASE_URL || 'mongodb://localhost:27017/hiphip-backend',
  TEST_DATABASE_URL:
    process.env.TEST_DATABASE_URL ||
    'mongodb://localhost:27017/hiphip-backend-test',
  MONGO_OPTIONS: {
    useNewUrlParser: true,
  },
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRY: process.env.JWT_EXPIRY || '7d',
  API_AUTH_TOKEN: process.env.API_AUTH_TOKEN,
  // DATABASE_URL:
  //     process.env.DATABASE_URL || 'postgres://localhost/thinkful-backend',
  // TEST_DATABASE_URL:
  //     process.env.TEST_DATABASE_URL ||
  //     'postgres://localhost/thinkful-backend-test'
};
