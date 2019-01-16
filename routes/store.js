'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const Store = require('../models/store');
const { ValidationError } = require('../errors');

const router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res, next) => {
  const requiredFields = ['name', 'address'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    throw new ValidationError(missingField, 'Missing field', 422);
  }

  const { name, address } = req.body;

  const newStore = { name, address };

  Store.create(newStore)
    .then(result => {
      res
        .location(`${req.originalUrl}/${result.id}`)
        .status(201)
        .json(result);
    })
    .catch(err => next(err));
});

router.get('/', (req, res, next) => {
  Store.find()
    .then(result => {
      res.json(result);
    })
    .catch(err => next(err));
});

module.exports = router;
