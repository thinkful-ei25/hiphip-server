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
function removeItem(items, head, deletedIndex) {
  const manSortItems = [];
  let currentIndex = head;
  //for each one, push it in, if index is equal to skip, if greater than, subtract one from next
  items.forEach((item, index) => {
    if (index < deletedIndex) {
      manSortItems.push(item);
    } else if (index === items.length) {
      manSortItems.push(item);
    } else if (index > deletedIndex) {
      item.next -= 1;
      manSortItems.push(item);
    }
  });

  while (items[currentIndex]) {
    manSortItems.push(items[currentIndex]);
    currentIndex = items[currentIndex].next;
  }
  return manSortItems;
}
function isEmpty(items, head, deletedIndex) {
  let empty = true;
  items.forEach(item => {
    if (items[head] === item && head === deletedIndex) {
      return;
    } else if (item.next) {
      empty = false;
    }
  });
  return empty;
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
  console.log(items);
  console.log(itemIndex, head);
  if (isEmpty(items)) {
    head = -1;
  } else if (itemIndex === head) {
    head = items[itemIndex].next;
  } else {
    let prevItemIndex = findPrevItemIndex(items, itemIndex);
    items[prevItemIndex].next = items[itemIndex].next;
  }

  // const newItems = removeItem(items, head);
  const newItems = items;
  console.log(newItems, head);
  return { newItems, head, itemIndex };
}
module.exports = { moveItem, deleteItem };
