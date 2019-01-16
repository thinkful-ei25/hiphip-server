'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');

const User = require('../models/user');
const { app } = require('..');

const { expect } = chai;
chai.use(chaiHttp);

const expectValidationError = (res, code = 422) => {
  expect(res).to.have.status(code);
  expect(res).to.be.json;
  expect(res.body).to.have.keys('code', 'reason', 'message', 'location');
  expect(res.body.reason).to.equal('ValidationError');
  return res;
};

describe('/api/users', () => {
  afterEach(() => User.deleteMany());

  const url = '/api/users';

  describe('Validation errors', () => {
    it('throws a ValidationError if fields are missing', () => {
      return chai
        .request(app)
        .post(url)
        .send()
        .then(expectValidationError);
    });

    it('throws a ValidationError if a non-string is received', () => {
      return chai
        .request(app)
        .post(url)
        .send({
          username: 'aseehra',
          password: [],
        })
        .then(expectValidationError)
        .then(res => {
          expect(res.body.message).to.equal(
            'Incorrect field type: expected string'
          );
          expect(res.body.location).to.equal('password');
        });
    });
  });

  it('should return a user object', () => {
    const newUser = {
      firstName: 'Alice',
      lastName: 'Foo',
      username: 'alice',
      password: 'password1234',
    };

    return chai
      .request(app)
      .post(url)
      .send(newUser)
      .then(res => {
        expect(res).to.have.status(201);
        expect(res).to.be.json;
        expect(res.body).to.have.keys('user');
        expect(res.body.user).to.have.keys(
          'id',
          'username',
          'firstName',
          'lastName'
        );
      });
  });
});
