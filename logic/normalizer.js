'use strict';

const pluralizer = require('pluralize');
const groceryTerms = {
  gallon: true,
  quart: true,
  pound: true,
  lb: true,
  kg: true,
  kilo: true,
  dozen: true,
  of: true,
  a: true,
  half: true,
  whole: true,
  and: true,
  or: true,
};

function normalizer(itemName) {
  if (itemName.length < 2) {
    return itemName;
  }
  const searchArray = itemName
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ');
  const filtered = searchArray.filter(
    word => isNaN(word) && !groceryTerms.hasOwnProperty(word)
  );

  if (filtered.length !== 1) {
    return itemName;
  } else {
    return pluralizer.singular(filtered[0]);
  }
}
module.exports = normalizer;
