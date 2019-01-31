'use strict';

const AisleLocation = require('../models/AisleLocation');
const Category = require('../models/Category');

function getCategory(name) {
  return Category.findOne({ name }).then(
    category => category || Category.create({ name })
  );
}

function findAndUpdateAisleLocation(storeId, categoryId, aisleNo = null) {
  //if no store just create aislelocation, no store
  if (!storeId) {
    return AisleLocation.create({ category: categoryId, aisleNo });
  }
  return AisleLocation.findOne({ category: categoryId, store: storeId }).then(
    aisleLocation => {
      if (!aisleLocation) {
        aisleLocation = new AisleLocation({
          category: categoryId,
          store: storeId,
        });
      }

      if (aisleNo) {
        aisleLocation.aisleNo = aisleNo;
      }

      return aisleLocation.save();
    }
  );
}

module.exports = { getCategory, findAndUpdateAisleLocation };
