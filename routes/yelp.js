'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const fetch = require('node-fetch');

const { ValidationError } = require('../errors');

const router = express.Router();

const jsonParser = bodyParser.json();
// return fetch(
//   `${STORE_API_BASE_URL}?term=${searchterm}&category=grocery&latitude=37.786882&longitude=-122.399972`,
//   {
//     method: 'GET',
//     headers: { Authorization: `Bearer ${API_authToken}` },
//     mode: 'no-cors',
//   }
// ).then(res => {
//   console.log(res);
// // });
// { term: 'whole',
//   category: 'grocery',
//   latitude: '37.786882',
//   longitude: '-122.399972' }
router.route('/').get((req, res, next) => {
  const { term, category, latitude, longitude } = req.query;
  console.log('HELLOOOOO!');
  fetch(
    `https://api.yelp.com/v3/businesses/search?term=${term}&category=${category}&latitude=${latitude}&longitude=${longitude}`,
    {
      method: 'get',
      headers: {
        Authorization: `Bearer FiidsBWee5-Rbjey4BkRf3lTwhfVXtIeqBaoxx_aPo1-CzsBorzm2jeNI9CUoKwW4asFAlWhysLTP5UEMmLm5QR3L1VZRmmweJv2A7YQB8WAZCeQ8_ckNwdbWCpCXHYx`,
      },
    }
  )
    .then(res => res.json())
    .then(json => console.log(json));
});

module.exports = router;
