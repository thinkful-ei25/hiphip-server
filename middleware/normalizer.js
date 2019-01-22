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

function normalizer(req, res, next) {
  const { name } = req.body;
  console.log(name);
  const filteredArray = [];
  const searchArray = name
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ');
  const filt = searchArray.filter(word => isNaN(word));
  for (let i = 0; i < filt.length; i++) {
    if (!groceryTerms.hasOwnProperty(filt[i])) {
      filteredArray.push(pluralizer.singular(filt[i]));
    }
  }
  req.normalized = filteredArray;
  next();
}
module.exports = normalizer;
