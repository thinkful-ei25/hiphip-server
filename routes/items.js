'use strict';
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const { HttpError, NotFoundError, ValidationError } = require('../errors');

const User = require('../models/user');
const ShoppingList = require('../models/shopping-list');
/*
likely to add other models as routes are expanded upon
- aislelocation model
- category model
*/

const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(express.json());
router.use(jwtAuth);

//Add an item to a list
router
  .route('/:listId')
  .get((req, res, next) => {
    const { id: userId } = req.user;
    const { listId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    ShoppingList.findById(listId)
      .then(list => {
        if (!list) {
          throw new NotFoundError();
        }
        const items = list.items;
        res.json({ items });
      })
      .catch(next);
  })
  .post((req, res, next) => {
    const { id: userId } = req.user;
    const { listId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    const { name, aisleLocation } = req.body;
    const requiredFields = ['name'];
    const missingField = requiredFields.find(field => {
      !(field in req.body);
    });
    if (missingField) {
      throw new ValidationError(missingField, 'Missing Field', 422);
    }
    let newItem;
    ShoppingList.findById(listId)
      .then(list => {
        if (!list) {
          throw new NotFoundError();
        }
        newItem = list.items.create({
          name,
        });
        list.items.push(newItem);
        return list.save();
      })
      .then(() => {
        res.json({ item: newItem });
      })
      .catch(next);
  });
router
  .route('/:listId/:id')
  .patch((req, res, next) => {
    const { listId, id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    ShoppingList.findById(listId)
      .then(list => {
        if (!list) {
          throw new NotFoundError();
        }
        const { name, isChecked, aisle } = req.body;
        const item = list.items.id(id);
        if (!item) {
          throw new NotFoundError();
        }
        if (name) {
          item.name = name;
        }
        if (isChecked !== item.isChecked) {
          item.isChecked = isChecked;
        }
        if (aisle) {
          item.aisle = aisle;
        }
        return list.save();
      })
      .then(list => {
        const item = list.items.id(id);
        res.json({ item });
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { listId, id } = req.params;
    ShoppingList.findById(listId)
      .then(list => {
        list.items.pull(id);
        return list.save();
      })
      .then(() => {
        res.sendStatus(204);
      })
      .catch(next);
  });

module.exports = router;
