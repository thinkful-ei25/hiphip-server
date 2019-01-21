'use strict';
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const { HttpError, NotFoundError, ValidationError } = require('../errors');

const User = require('../models/User');
const ShoppingList = require('../models/ShoppingList');
const {
  getCategory,
  findAndUpdateAisleLocation,
} = require('../logic/itemManagement');

/*
likely to add other models as routes are expanded upon
- aislelocation model
- category model
*/

const router = express.Router({ mergeParams: true });
const jwtAuth = passport.authenticate('jwt', { session: false });

router.use(express.json());
router.use(jwtAuth);

//Add an item to a list
router
  .route('/')
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
        res.json({ items: list.items });
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

    let list;
    let newItem;
    Promise.all([ShoppingList.findById(listId), getCategory(name)])
      .then(([_list, category]) => {
        if (!_list) {
          throw new NotFoundError();
        }
        list = _list;

        return list.store
          ? findAndUpdateAisleLocation(list.store, category._id, aisleLocation)
          : null;
      })
      .then(aisleLocation => {
        newItem = list.items.create({
          name,
          aisleLocation: aisleLocation && aisleLocation._id,
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
  .route('/:id')
  .patch((req, res, next) => {
    const { listId, id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    ShoppingList.findById(listId)
      .populate('items.aisleLocation')
      .then(list => {
        if (!list) {
          throw new NotFoundError();
        }
        const { name, isChecked, aisleLocation } = req.body;
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
        if (aisleLocation) {
          item.aisleLocation.aisleNo = aisleLocation;
        }

        return Promise.all([list.save(), item.aisleLocation.save()]);
      })
      .then(([list]) => {
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
