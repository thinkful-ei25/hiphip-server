'use strict';

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const passport = require('passport');

const { PORT, CLIENT_ORIGIN } = require('./config');
const { dbConnect } = require('./db/db-mongoose');

const usersRouter = require('./routes/users');
const authRouter = require('./routes/auth');
const storeRouter = require('./routes/store');
const listRouter = require('./routes/lists');
const itemRouter = require('./routes/items');
const errorHandler = require('./middleware/errorHandler');

const localStrategy = require('./passport/local');
const jwtStrategy = require('./passport/jwt');

const app = express();

passport.use(localStrategy);
passport.use(jwtStrategy);

app.use(
  morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
    skip: () => process.env.NODE_ENV === 'test',
  })
);

app.use(
  cors({
    origin: CLIENT_ORIGIN,
  })
);

app.use('/api/users', usersRouter);
app.use('/auth', authRouter);
app.use('/api/stores', storeRouter);
app.use('/api/lists', listRouter);
app.use(errorHandler);

/* eslint-disable no-console */
function runServer(port = PORT) {
  const server = app
    .listen(port, () => {
      console.info(`App listening on port ${server.address().port}`);
    })
    .on('error', err => {
      console.error('Express failed to start');
      console.error(err);
    });
}
/* eslint-enable no-console */

if (require.main === module) {
  dbConnect();
  runServer();
}

module.exports = { app };
