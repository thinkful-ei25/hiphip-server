function findPrevItemIndex(items, index) {
  let newIndex;
  items.forEach((item, i) => {
    if (item.next === index) {
      newIndex = i;
    }
  });
  return newIndex;
}
function moveItem(items, itemId, head, down = false) {
  const newItems = items.slice();
  let itemIndex;
  let originalIndex;
  if (!down) {
    newItems.forEach((item, i) => {
      if (item.id === itemId) {
        itemIndex = i;
      }
    });
  } else {
    newItems.forEach((item, i) => {
      if (item.id === itemId) {
        originalIndex = i;
        itemIndex = newItems[i].next;
      }
    });
  }
  if ((!down && itemIndex === head) || (down && !newItems[itemIndex])) {
    return { newItems, head };
  }

  if (newItems[head].next === itemIndex && !down) {
    newItems[head].next = newItems[itemIndex].next;
    newItems[itemIndex].next = head;
    head = itemIndex;
    return { newItems, head };
  }

  if (head === originalIndex && down) {
    newItems[head].next = newItems[itemIndex].next;
    newItems[itemIndex].next = head;
    head = itemIndex;
    return { newItems, head };
  }

  let prevItemIndex = findPrevItemIndex(newItems, itemIndex);
  let prevPrevItemIndex = findPrevItemIndex(newItems, prevItemIndex);
  const newNext = newItems[prevPrevItemIndex].next;
  newItems[prevPrevItemIndex].next = newItems[prevItemIndex].next;
  newItems[prevItemIndex].next = newItems[itemIndex].next;
  newItems[itemIndex].next = newNext;

  return { newItems, head };
}

//for every item after the item i'm deleting add one to next (except the last one)
function sortItems(items, head) {
  const sorted = [];
  let i = head;
  //for each one, push it in, if index is equal to skip, if greater than, subtract one from next
  while (items[i]) {
    sorted.push(items[i]);
    i = items[i].next;
    if (!i) {
      sorted[sorted.length - 1].next = null;
    } else {
      sorted[sorted.length - 1].next = sorted.length;
    }
  }
  return sorted;
}

function deleteItem(items, itemId, head) {
  let itemIndex;
  items.forEach((item, i) => {
    if (item.id === itemId) {
      itemIndex = i;
    }
  });
  if (items.length === 1) {
    const newItems = [];
    head = -1;
    return { newItems, head };
  }
  if (itemIndex === head) {
    head = items[itemIndex].next;
  } else {
    let prevItemIndex = findPrevItemIndex(items, itemIndex);
    items[prevItemIndex].next = items[itemIndex].next;
  }

  const newItems = sortItems(items, head);
  head = 0;
  return { newItems, head, itemIndex };
}
module.exports = { moveItem, deleteItem };
