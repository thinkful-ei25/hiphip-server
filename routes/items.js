'use strict';
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const { HttpError, NotFoundError, ValidationError } = require('../errors');

const User = require('../models/user');
const List = require('../models/shopping-list');
const ListItem = require('../models/shopping-list-item');
const router = express.Router();
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(express.json());
router.use(jwtAuth);

//Add an item to a list
router.route('/').post((req, res, next) => {
  const { id: userId } = req.user;
  const { listId } = req.body;
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
  User.findById(userId)
    .then(user => {
      const list = user.shoppingLists.id(listId);
      if (!list) {
        throw new NotFoundError();
      }
      newItem = user.shoppingLists.items.create({
        name,
        aisleLocation,
      });
      list.push(newItem);
      return user.save();
    })
    .then(() => {
      res.json({ item: newItem });
    })
    .catch(next);
});

module.exports = router;
