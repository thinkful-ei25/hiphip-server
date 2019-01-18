'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const User = require('../models/user');
const { ValidationError } = require('../errors');

const router = express.Router();

const jsonParser = bodyParser.json();

// Post to register a new user
router.post('/', jsonParser, (req, res, next) => {
  const requiredFields = ['username', 'password'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    throw new ValidationError(missingField, 'Missing field', 422);
  }

  const stringFields = ['username', 'password', 'firstName', 'lastName'];
  const nonStringField = stringFields.find(
    field => field in req.body && typeof req.body[field] !== 'string'
  );

  if (nonStringField) {
    throw new ValidationError(
      nonStringField,
      'Incorrect field type: expected string',
      422
    );
  }

  const explicityTrimmedFields = ['username', 'password'];
  const nonTrimmedField = explicityTrimmedFields.find(
    field => req.body[field].trim() !== req.body[field]
  );

  if (nonTrimmedField) {
    throw new ValidationError(
      nonTrimmedField,
      'Cannot start or end with whitespace',
      422
    );
  }

  const sizedFields = {
    username: {
      min: 1,
    },
    password: {
      min: 8,
      max: 72,
    },
  };
  const tooSmallField = Object.keys(sizedFields).find(
    field =>
      'min' in sizedFields[field] &&
      req.body[field].trim().length < sizedFields[field].min
  );
  const tooLargeField = Object.keys(sizedFields).find(
    field =>
      'max' in sizedFields[field] &&
      req.body[field].trim().length > sizedFields[field].max
  );

  if (tooSmallField || tooLargeField) {
    throw new ValidationError(
      tooSmallField || tooLargeField,
      tooSmallField
        ? `Must be at least ${sizedFields[tooSmallField].min} characters long`
        : `Must be at most ${sizedFields[tooLargeField].max} characters long`,
      422
    );
  }

  let { username, password, firstName, lastName } = req.body;

  return User.find({ username })
    .countDocuments()
    .then(count => {
      if (count > 0) {
        // There is an existing user with the same username
        return Promise.reject(
          new ValidationError('username', 'Username already taken', 422)
        );
      }
      // If there is no existing user, hash the password
      return User.hashPassword(password);
    })
    .then(hash => {
      return User.create({
        username,
        password: hash,
        firstName,
        lastName,
      });
    })
    .then(user => {
      return res.status(201).json({ user });
    })
    .catch(next);
});

module.exports = router;
