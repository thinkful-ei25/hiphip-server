'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const { API_AUTH_TOKEN } = require('../config');

const router = express.Router();

router.route('/coords').get((req, res, next) => {
  const { term, category, latitude, longitude } = req.query;
  fetch(
    `https://api.yelp.com/v3/businesses/search?term=${term}&category=${category}&latitude=${latitude}&longitude=${longitude}`,
    {
      method: 'get',
      headers: {
        Authorization: `Bearer ${API_AUTH_TOKEN}`,
      },
    }
  )
    .then(res => res.json())
    .then(businesses => {
      res.json(businesses);
    })
    .catch(next);
});

router.route('/location').get((req, res, next) => {
  const { term, category, location } = req.query;
  fetch(
    `https://api.yelp.com/v3/businesses/search?term=${term}&category=${category}&location=${location}`,
    {
      method: 'get',
      headers: {
        Authorization: `Bearer ${API_AUTH_TOKEN}`,
      },
    }
  )
    .then(res => res.json())
    .then(businesses => {
      res.json(businesses);
    })
    .catch(next);
});

module.exports = router;
