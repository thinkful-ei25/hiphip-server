'use strict';

const express = require('express');
const router = express.Router();

//load sample list data
const itemsData = require('../db/items');
const items = simDB.initialze(itemsData);

/* ============ GET ALL ITEMS ================ */

router.get('/', (req, res, next) => {
  items
    .then(list => {
      res.json(list);
    })
    .catch(err => {
      next(err);
    });
});

/* ===========Get single item ===========*/

router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  items
    .find(id)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

//update an item

router.put('/:id', (req, res, next) => {
  const id = req.params.id;

  const updateItem = {};
  const updateFields = ['item', 'aisle'];

  updateFields.forEach(field => {
    if (field in req.body) {
      updateItem[field] = req.body[field];
    }
  });

  if (!updateItem.item) {
    const err = new Error('Missing item name');
    err.status = 400;
    return next(err);
  }

  items
    .update(id, updateItem)
    .then(item => {
      if (item) {
        res.json(item);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});

//add new item

router.post('/', (req, res, next) => {
  const {item, aisle} = req.body;
  const newItem = {item, aisle};

  if(!newItem.item){
    const err = new Error('Missing item name');
    err.status = 400;
    return next(err);
  }

  items.create(newItem)
  .then(item => {
    if(item)
  })
});
