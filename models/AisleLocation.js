'use strict';
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  store: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Store',
  },
  aisleNo: { type: String, default: null },
});

schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  },
});

module.exports = mongoose.model('AisleLocation', schema);
