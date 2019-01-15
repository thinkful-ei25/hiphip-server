'use strict';

const mongoose = require('mongoose');

const ShoppingListItem = require('./shopping-list-item');

const shoppingListSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    items: { type: [ShoppingListItem], default: [] },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, result) => {
        delete result._id;
        delete result.__v;
      },
    },
  }
);

module.exports = shoppingListSchema;
