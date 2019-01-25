'use strict';

const mongoose = require('mongoose');

const ShoppingListItem = require('./ShoppingListItem');

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
    head: { type: Number, required: true, default: 0 },
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

module.exports = mongoose.model('ShoppingList', shoppingListSchema);
