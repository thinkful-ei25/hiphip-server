// trim, to lowercase, remove numbers
function normalizer(searchString) {
  const searchArray = searchString.split(' ');
  const filtered = searchArray.filter(word => {
    return isNaN(word) ? word.toLowerCase() : null;
    // const lower = word.toLowerCase();
    // // console.log(lower);
    // word = 'worrrdd'
    // return word;
  });
  return filtered;
}

console.log(normalizer('2 black ponies NAMED horse 223Face.'));
