'use strict';

const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const schema = new mongoose.Schema({
  firstName: { type: String, default: '' },
  lastName: { type: String, default: '' },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  shoppingLists: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'ShoppingList' }],
    default: [],
  },
});

schema.set('toJSON', {
  virtuals: true,
  transform: (doc, result) => {
    delete result._id;
    delete result.__v;
    delete result.password;
  },
});

schema.methods.validatePassword = function(pwd) {
  const currentUser = this;
  return bcrypt.compare(pwd, currentUser.password);
};

schema.statics.hashPassword = function(pwd) {
  return bcrypt.hash(pwd, 10);
};

module.exports = mongoose.model('User', schema);
