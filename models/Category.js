'use strict';
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
});

schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  },
});

module.exports = mongoose.model('Category', schema);
