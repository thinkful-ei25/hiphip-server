'use strict';
const express = require('express');
const passport = require('passport');

const User = require('../models/user');
const Store = require('../models/store');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(express.json());
router.use(jwtAuth);

router.get('/:id', (req, res, next) => {
  const { id: userId } = req.user;
  const { id } = req.params;
  //TODO: check that id is an ObjectId
  User.findById(userId)
    .then(user => {
      const list = user.shoppingLists.id(id);
      console.log(list);
      if (list) {
        res.json(list);
      } else {
        //TODO: add an actual error here pls
        throw new Error();
      }
    })
    .catch(next);
});

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

//5c3e601d4c6d717f58dd1d83
