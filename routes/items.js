'use strict';
const express = require('express');
const passport = require('passport');
const mongoose = require('mongoose');

const { HttpError, NotFoundError, ValidationError } = require('../errors');

const ShoppingList = require('../models/ShoppingList');
const {
  getCategory,
  findAndUpdateAisleLocation,
} = require('../logic/itemManagement');
const normalizer = require('../logic/normalizer');
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
    const { id: user } = req.user;
    const { listId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(404, `${listId} is not a valid ObjectId`);
    }
    ShoppingList.findOne({ user, listId })
      .populate('items.aisleLocation', 'aisleNo')
      .then(list => {
        if (!list) {
          throw new NotFoundError();
        }
        res.json({ items: list.items });
      })
      .catch(next);
  })
  .post((req, res, next) => {
    const { id: user } = req.user;
    const { listId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    const { name, aisleLocation } = req.body;
    const requiredFields = ['name'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
      throw new ValidationError(missingField, 'Missing Field', 422);
    }

    let list;
    let newItem;
    let aisle;
    Promise.all([
      ShoppingList.findOne({ user, _id: listId }),
      getCategory(normalizer(name)),
    ])
      .then(([_list, category]) => {
        if (!_list) {
          throw new NotFoundError();
        }
        list = _list;

        return findAndUpdateAisleLocation(
          list.store,
          category._id,
          aisleLocation
        );
      })
      .then(aisleLocation => {
        aisle = aisleLocation;
        newItem = list.items.create({
          name,
          aisleLocation: aisleLocation && aisleLocation._id,
        });
        list.items.push(newItem);
        return list.save();
      })
      .then(() => {
        newItem.aisleLocation = aisle;
        res.json({ item: newItem });
      })
      .catch(next);
  })
  .patch((req, res, next) => {
    const { id: user } = req.user;
    const { listId } = req.params;
    const { direction, index } = req.body;
    const requiredFields = ['direction', 'index'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
      throw new ValidationError(missingField, 'Missing Field', 422);
    }
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    ShoppingList.findOne({ user, _id: listId })
      .populate('items.aisleLocation', 'aisleNo')
      .then(list => {
        const reordered = list.items.slice();
        const last = reordered.length - 1;
        if (direction === 'up' && index !== 0) {
          const temp = reordered[index - 1];
          reordered[index - 1] = reordered[index];
          reordered[index] = temp;
        }
        if (direction === 'down' && index !== last) {
          const temp = reordered[index + 1];
          reordered[index + 1] = reordered[index];
          reordered[index] = temp;
        }
        list.items = reordered;
        return list.save();
      })
      .then(newList => {
        res.json(newList);
      })
      .catch(next);
  });
router
  .route('/:id')
  .patch((req, res, next) => {
    const { id: user } = req.user;
    const { listId, id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    let list;
    let item;
    ShoppingList.findOne({ user, _id: listId })
      .populate('items.aisleLocation')
      .then(_list => {
        list = _list;
        if (!list) {
          throw new NotFoundError();
        }
        const { name, isChecked, aisleLocation } = req.body;
        item = list.items.id(id);
        if (!item) {
          throw new NotFoundError();
        }

        if (name) {
          item.name = name;
        }

        if (isChecked !== item.isChecked) {
          item.isChecked = isChecked;
        }

        /* eslint-disable indent */
        return Promise.resolve(
          getCategory(item.name).then(category =>
            findAndUpdateAisleLocation(
              list.store && list.store._id,
              category._id,
              aisleLocation.aisleNo
            )
          )
        );
        /* eslint-enable indent */
      })
      .then(_aisleLocation => {
        item.aisleLocation = _aisleLocation;
        return list.save();
      })
      .then(_list => {
        const _item = _list.items.id(id);
        res.json({ item: _item });
      })
      .catch(next);
  })
  .delete((req, res, next) => {
    const { listId, id } = req.params;
    const { id: user } = req.user;
    ShoppingList.findOne({ user, _id: listId })
      .populate('items.aisleLocation', 'aisleNo')
      .then(list => {
        let index;
        list.items.forEach((item, i) => {
          if (item.id === id) {
            index = i;
          }
        });
        if (index >= 0) {
          list.items.splice(index, 1);
        }
        return list.save();
      })
      .then(list => {
        res.json(list);
      })
      .catch(next);
  });

module.exports = router;
