'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: String, required: true, unique: true },
  aisles: [
    {
      aisleNo: { type: String },
      categories: { type: Array },
    },
  ],
});

schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  },
});

module.exports = mongoose.model('Store', schema);
