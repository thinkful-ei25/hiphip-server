'use strict';
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');

const User = require('../models/User');
const Store = require('../models/Store');
const { HttpError, NotFoundError, ValidationError } = require('../errors');
const ShoppingList = require('../models/ShoppingList');

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });
const itemRouter = require('./items');

router.use(express.json());
router.use(jwtAuth);

router.use('/:listId/items', itemRouter);
router
  .route('/:id')
  .get((req, res, next) => {
    const { id: userId } = req.user;
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new HttpError(422, `${id} is not a valid ObjectId`);
    }

    ShoppingList.findById(id)
      .populate('store')
      .then(shoppingList => {
        if (!shoppingList) {
          throw new NotFoundError();
        }

        // TODO: see if there is a better way of comparing ObjectIds
        if (shoppingList.user.toString() !== userId) {
          throw new NotFoundError();
        }

        res.json({ list: shoppingList });
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { id: userId } = req.user;
    const { id } = req.params;
    const { name, store } = req.body;

    ShoppingList.findOne({ _id: id, user: userId })
      .populate('store')
      .then(shoppingList => {
        if (!shoppingList) {
          throw new NotFoundError();
        }

        if (name) {
          shoppingList.name = name;
        }

        let newStore = Promise.resolve(shoppingList.store);
        if (store) {
          const requiredFields = ['name', 'address', 'googleId'];
          const missingField = requiredFields.find(field => !(field in store));
          if (missingField) {
            throw new ValidationError(missingField, 'Missing field', 422);
          }

          newStore = Store.findOneAndUpdate(
            { googleId: store.googleId },
            store,
            {
              upsert: true,
              new: true,
            }
          );
        }

        return newStore.then(store => {
          shoppingList.store = store;
          return shoppingList.save();
        });
      })
      .then(shoppingList => {
        res.json({ list: shoppingList });
      })
      .catch(next);
    //TODO: Handle duplicate key value properly PLZ
  })
  .delete((req, res, next) => {
    const { id: userId } = req.user;
    const { id } = req.params;

    ShoppingList.findOneAndDelete({ _id: id, user: userId })
      .then(() => res.sendStatus(204))
      .catch(next);
  });

router
  .route('/')
  .get((req, res, next) => {
    const { id: userId } = req.user;
    User.findById(userId)
      .populate({
        path: 'shoppingLists',
        populate: {
          path: 'store',
        },
      })
      .then(user => {
        const { shoppingLists } = user;
        res.json({ lists: shoppingLists });
      })
      .catch(next);
  })

  //
  .post((req, res, next) => {
    const { id: userId } = req.user;
    const { name, store } = req.body;
    const requiredFields = ['name'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
      throw new ValidationError(missingField, 'Missing field', 422);
    }

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
    let newShoppingList;
    storePromise.then(storeObject => {
      ShoppingList.create({ name, store: storeObject, user: userId })
        .then(shoppingList => {
          newShoppingList = shoppingList;
          return User.findById(userId);
        })
        .then(user => {
          user.shoppingLists.push(newShoppingList);
          return user.save();
        })
        .then(() => {
          res.status(201).json({ list: newShoppingList });
        })
        .catch(next);
    });
  });

module.exports = router;
