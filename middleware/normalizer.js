const groceryTerms = {
  gallon: true,
  quart: true,
  pound: true,
  lb: true,
  kg: true,
  kilo: true,
  dozen: true,
};
function normalizer(searchString) {
  const searchArray = searchString
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ');
  const filtered = searchArray.filter(word => isNaN(word));

  return filtered;
}

console.log(normalizer('2 black ponies, NAMED horse 223Face.'));
