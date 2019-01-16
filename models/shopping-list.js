'use strict';

const mongoose = require('mongoose');

const ShoppingListItem = require('./shopping-list-item');

const shoppingListSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    store: { type: mongoose.Schema.Types.ObjectId, ref: 'Store' },
    items: { type: [ShoppingListItem], default: [] },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    toJSON: {
      virtuals: true,
      transform: (doc, result) => {
        delete result._id;
        delete result.__v;
        delete result.items;
      },
    },
  }
);

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
