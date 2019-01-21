'use strict';
const express = require('express');
const passport = require('passport');

const Store = require('../models/store');
const { ValidationError } = require('../errors');

const router = express.Router();

const jwtAuth = passport.authenticate('jwt', { session: false });
router.use(express.json());
router.use(jwtAuth);

router.post('/', (req, res, next) => {
  const requiredFields = ['name', 'address', 'googleId'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    throw new ValidationError(missingField, 'Missing field', 422);
  }

  const { name, address, googleId } = req.body;

  const newStore = { name, address, googleId };

  Store.create(newStore)
    .then(store => {
      res.status(201).json({ store });
    })
    .catch(next);
});

router.get('/', (req, res, next) => {
  Store.find()
    .then(stores => {
      res.json({ stores });
    })
    .catch(next);
});

module.exports = router;
