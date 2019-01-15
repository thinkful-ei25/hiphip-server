'use strict';
const express = require('express');
const passport = require('passport');

const User = require('../models/user');
const Store = require('../models/store');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(express.json());
router.use(jwtAuth);

router
  .route('/')
  .get((req, res, next) => {
    const { id: userId } = req.user;
    User.findById(userId)
      .then(user => {
        const { shoppingLists } = user;
        res.json({ shoppingLists });
      })
      .catch(next);
  })

  .post((req, res, next) => {
    const { id: userId } = req.user;
    const { name, store } = req.body;
    const requiredFields = ['name'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
      return res.status(422).json({
        code: 422,
        reason: 'ValidationError',
        message: 'Missing field',
        location: missingField,
      });
    }
    let newList;

    let storePromise = Promise.resolve(null);

    if (store) {
      const requiredFields = ['name', 'address', 'googleId'];
      const missingField = requiredFields.find(field => !(field in store));
      if (missingField) {
        return res.status(422).json({
          code: 422,
          reason: 'ValidationError',
          message: 'Missing field',
          location: missingField,
        });
      }

      storePromise = Store.findOneAndUpdate(
        { googleId: store.googleId },
        store,
        {
          upsert: true,
          new: true,
        }
      );
    }

    storePromise.then(storeObject => {
      User.findById(userId)
        .then(user => {
          newList = user.shoppingLists.create({
            name,
            store: storeObject ? storeObject.id : null,
          });
          user.shoppingLists.push(newList);
          return user.save();
        })
        .then(() => {
          res.json({ shoppingList: newList });
        })
        .catch(next);
    });
  });

module.exports = router;
