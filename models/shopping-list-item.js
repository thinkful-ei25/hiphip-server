'use strict';

const mongoose = require('mongoose');

const shoppingListItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    aisleLocation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'AisleLocation',
    },
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

module.exports = shoppingListItemSchema;
