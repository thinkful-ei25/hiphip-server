'use strict';

const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  name: { type: String, required: true },
  address: { type: Object, required: true },
  yelpId: { type: String, required: true, unique: true },
  coordinates: {
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
  },
});

schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
  },
});

module.exports = mongoose.model('Store', schema);
