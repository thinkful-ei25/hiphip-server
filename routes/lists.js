'use strict';
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const User = require('../models/user');
const Store = require('../models/store');
const { HttpError, NotFoundError, ValidationError } = require('../errors');
const ShoppingList = require('../models/shopping-list');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(express.json());
router.use(jwtAuth);

router
  .route('/:id')
  .get((req, res, next) => {
    const { id: userId } = req.user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(422, `${id} is not a valid ObjectId`);
    }

    User.findById(userId)
      .then(user => {
        const list = user.shoppingLists.id(id);
        if (!list) {
          throw new NotFoundError();
        }

        res.json(list);
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    User.findById(userId).then(user => {
      const list = user.shoppingLists.id(id);
      if (!list) {
        throw new NotFoundError();
      }
      const { name, store: newStore } = req.body;
      if (name) {
        list.name = name;
      }
      let storePromise = Promise.resolve(list.store);
      if (newStore) {
        storePromise = Store.findOneAndUpdate(
          { googleId: newStore.googleId },
          newStore,
          {
            upsert: true,
            new: true,
          }
        );
      }
      storePromise
        .then(store => {
          list.store = store;
        })
        .then(() => {
          return user.save();
        })
        .then(user => {
          const list = user.shoppingLists.id(id);
          res.json({ shoppingList: list });
        })
        .catch(next);
    });
  })
  .delete((req, res, next) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    User.findById(userId)
      .then(user => {
        user.shoppingLists.pull(id);
        return user.save();
      })
      .then(() => {
        res.sendStatus(204);
      })
      .catch(next);
  });

router
  .route('/')
  .get((req, res, next) => {
    const { id: userId } = req.user;
    User.findById(userId)
      .populate('shoppingLists')
      .then(user => {
        const { shoppingLists } = user;
        res.json({ lists: shoppingLists });
      })
      .catch(next);
  })

  .post((req, res, next) => {
    const { id: userId } = req.user;
    const { name, store } = req.body;
    const requiredFields = ['name'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
      throw new ValidationError(missingField, 'Missing field', 422);
    }
    let newList;

    let storePromise = Promise.resolve(null);

    if (store) {
      const requiredFields = ['name', 'address', 'googleId'];
      const missingField = requiredFields.find(field => !(field in store));
      if (missingField) {
        throw new ValidationError(missingField, 'Missing field', 422);
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
