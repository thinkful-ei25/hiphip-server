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

function normalizer(searchString) {
  filteredArray = [];
  const searchArray = searchString
    .replace(/[^\w\s]|_/g, '')
    .replace(/\s+/g, ' ')
    .toLowerCase()
    .split(' ');
  const filt = searchArray.filter(word => isNaN(word));
  for (let i = 0; i < filt.length; i++) {
    if (!groceryTerms.hasOwnProperty(filt[i])) {
      filteredArray.push(filt[i]);
    }
  }
  return filteredArray;
}

// console.log(normalizer('2 black ponies, NAMED horse 223Face.'));
let input = 'cream cheese';
if (normalizer(input).length > 1) {
  console.log(input);
} else {
  console.log(normalizer(input));
}

input = '2% milk';
if (normalizer(input).length > 1) {
  console.log(input);
} else {
  console.log(normalizer(input).join(''));
}

input = 'two apples';
if (normalizer(input).length > 1) {
  console.log(input);
} else {
  console.log(normalizer(input).join(''));
}
