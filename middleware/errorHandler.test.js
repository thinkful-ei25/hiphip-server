'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const express = require('express');

const errorHandler = require('./errorHandler');
const { app } = require('..');

const { expect } = chai;
chai.use(chaiHttp);

describe('Error middleware', () => {
  it('Should return 404 if a route is not found', () => {
    return chai
      .request(app)
      .get('/thisIsATestRoute')
      .then(res => {
        expect(res).to.have.status(404);
        expect(res).to.be.json;
        expect(res.body).to.have.keys('code', 'message');
        expect(res.body.message).to.equal('Not found');
        expect(res.body.code).to.equal(404);
      });
  });

  it('Should return 500 if an unknown error is passed to next', () => {
    // Create a temporary application so that we can test our middleware without
    // mocking
    const tempApp = express();
    tempApp.use((req, res, next) => {
      next(new Error('My error type'));
    });
    tempApp.use(errorHandler);

    return chai
      .request(tempApp)
      .get('/')
      .then(res => {
        expect(res).to.have.status(500);
        expect(res).to.be.json;
        expect(res.body).to.have.keys('code', 'message');
        expect(res.body.message).to.equal('Internal server error');
        expect(res.body.code).to.equal(500);
      });
  });
});
