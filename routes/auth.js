'use strict';
const express = require('express');
const passport = require('passport');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const config = require('../config');
const router = express.Router();

const createAuthToken = function(user) {
  return jwt.sign({ user }, config.JWT_SECRET, {
    subject: user.username,
    expiresIn: config.JWT_EXPIRY,
    algorithm: 'HS256',
  });
};

const localAuth = passport.authenticate('local', { session: false });
router.use(bodyParser.json());
// The user provides a username and password to login
router.post('/login', localAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

const jwtAuth = passport.authenticate('jwt', { session: false });

// The user exchanges a valid JWT for a new one with a later expiration
router.post('/refresh', jwtAuth, (req, res) => {
  const authToken = createAuthToken(req.user);
  res.json({ authToken });
});

module.exports = router;

// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjp7ImZpcnN0TmFtZSI6IiIsImxhc3ROYW1lIjoiIiwidXNlcm5hbWUiOiJ1c2VyTmFtZSIsInNob3BwaW5nTGlzdHMiOltdLCJpZCI6IjVjM2Y1NmRlOWI2MzYwM2ZmZTczMmU3MCJ9LCJpYXQiOjE1NDc2NTQ5OTQsImV4cCI6MTU0ODI1OTc5NCwic3ViIjoidXNlck5hbWUifQ.tieYVDVKiBvnaE82EJGOF-Q1l2yHag-dgRWKy0FJdu8
