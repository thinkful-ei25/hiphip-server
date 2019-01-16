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
  })
  .patch((req, res, next) => {
    const { listId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    const { name, isChecked, aisle } = req.body;
  });

module.exports = router;
