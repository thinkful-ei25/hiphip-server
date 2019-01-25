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
const normalizer = require('../logic/normalizer');
/*
likely to add other models as routes are expanded upon
- aislelocation model
- category model
*/

const router = express.Router({ mergeParams: true });
const jwtAuth = passport.authenticate('jwt', { session: false });
const { moveItem, deleteItem } = require('./utils');
router.use(express.json());
router.use(jwtAuth);

//Add an item to a list
router
  .route('/')
  .patch((req, res, next) => {
    const { id: user } = req.user;
    const { listId } = req.params;
    const { direction, itemId } = req.body;
    const requiredFields = ['direction', 'itemId'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
      throw new ValidationError(missingField, 'Missing Field', 422);
    }
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }

    if (!mongoose.Types.ObjectId.isValid(itemId)) {
      throw new HttpError(422, `${itemId} is not a valid ObjectId`);
    }

    ShoppingList.findOne({ user, _id: listId })
      .then(list => {
        let movedList;
        if (direction === 'up') {
          movedList = moveItem(list.items, itemId, list.head);
        } else {
          movedList = moveItem(list.items, itemId, list.head, true);
        }
        list.items = movedList.newItems;
        list.head = movedList.head;
        return list.save();
      })
      .then(newList => res.json(newList))
      .catch(next);
  })
  .get((req, res, next) => {
    const { id: userId } = req.user;
    const { listId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    ShoppingList.findById(listId)
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
    const { id: userId } = req.user;

    const { listId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(listId)) {
      throw new HttpError(422, `${listId} is not a valid ObjectId`);
    }
    const { name, aisleLocation, next: nextItem } = req.body;
    const requiredFields = ['name'];
    const missingField = requiredFields.find(field => !(field in req.body));
    if (missingField) {
      throw new ValidationError(missingField, 'Missing Field', 422);
    }

    let list;
    let newItem;
    const normalizedName = normalizer(name);
    let aisle;
    Promise.all([ShoppingList.findById(listId), getCategory(normalizedName)])
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
        aisle = aisleLocation;
        newItem = list.items.create({
          name,
          aisleLocation: aisleLocation && aisleLocation._id,
          next: null,
        });
        const lastItem = list.items.findIndex(item => !item.next);
        if (lastItem !== -1) {
          list.items[lastItem].next = list.items.length;
        }
        if (lastItem === -1) {
          list.head = 0;
        }
        list.items.push(newItem);
        return list.save();
      })
      .then(() => {
        newItem.aisleLocation = aisle;
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
    let list;
    let item;
    ShoppingList.findById(listId)
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

        if (aisleLocation && !list.store) {
          throw new HttpError(
            422,
            'Cannot update aisle information for a list not associated with a store'
          );
        }

        if (name) {
          item.name = name;
        }

        if (isChecked !== item.isChecked) {
          item.isChecked = isChecked;
        }

        /* eslint-disable indent */
        return Promise.resolve(
          list.store
            ? getCategory(item.name).then(category =>
                findAndUpdateAisleLocation(
                  list.store._id,
                  category._id,
                  aisleLocation
                )
              )
            : null
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
      .then(list => {
        const { newItems, head } = deleteItem(list.items, id, list.head);
        console.log('new items:', newItems, 'head', head);
        list.items = newItems;
        list.head = head;
        return list.save();
      })
      .then(() => {
        res.sendStatus(204);
      })
      .catch(next);
  });

module.exports = router;
