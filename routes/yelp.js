'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const { YELP_AUTH_TOKEN } = require('../config');
const { ValidationError } = require('../errors');

const router = express.Router();

router.route('/coords').get((req, res, next) => {
  const { term, category, latitude, longitude } = req.body;
  const requiredFields = ['term', 'category', 'latitude', 'longitude'];
  const missingField = requiredFields.find(field => req.body[field] === '');
  if (missingField) {
    throw new ValidationError(missingField, 'Missing field', 422);
  }
  fetch(
    `https://api.yelp.com/v3/businesses/search?term=${term}&category=${category}&latitude=${latitude}&longitude=${longitude}`,
    {
      method: 'get',
      headers: {
        Authorization: `Bearer ${YELP_AUTH_TOKEN}`,
      },
    }
  )
    .then(res => res.json())
    .then(arr => {
      let answer = arr.businesses;
      answer = answer.slice(0, 7);
      answer.sort(function(a, b) {
        return a.distance - b.distance;
      });
      res.json({ businesses: answer });
    })
    .catch(next);
});

router.route('/location').get((req, res, next) => {
  const { term, category, location } = req.body;
  const requiredFields = ['term', 'category', 'location'];
  const missingField = requiredFields.find(field => req.body[field] === '');
  if (missingField) {
    throw new ValidationError(missingField, 'Missing field', 422);
  }
  fetch(
    `https://api.yelp.com/v3/businesses/search?term=${term}&category=${category}&location=${location}`,
    {
      method: 'get',
      headers: {
        Authorization: `Bearer ${YELP_AUTH_TOKEN}`,
      },
    }
  )
    .then(res => res.json())
    .then(arr => {
      let answer = arr.businesses;
      answer = answer.slice(0, 7);
      answer.sort(function(a, b) {
        return a.distance - b.distance;
      });
      res.json({ businesses: answer });
    })
    .catch(next);
});

module.exports = router;
