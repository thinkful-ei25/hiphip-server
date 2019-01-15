'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const Store = require('../models/store');

const router = express.Router();

const jsonParser = bodyParser.json();

router.post('/', jsonParser, (req, res, next) => {
  const requiredFields = ['name', 'address'];
  const missingField = requiredFields.find(field => !(field in req.body));

  if (missingField) {
    return res.status(422).json({
      code: 422,
      reason: 'ValidationError',
      message: 'Missing field',
      location: missingField,
    });
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
