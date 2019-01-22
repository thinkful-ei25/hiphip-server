'use strict';

const { expect } = require('chai');

const AisleLocation = require('../models/AisleLocation');
const Category = require('../models/Category');
const { findAndUpdateAisleLocation, getCategory } = require('./itemManagement');

describe('Item Management', () => {
  describe('getCategory', () => {
    afterEach(() => {
      return Category.deleteMany();
    });

    it('should create a new category if one is not found', () => {
      const name = 'my awesome category';
      return getCategory(name)
        .then(() => Category.findOne({ name }))
        .then(category => {
          expect(category).to.exist;
          expect(category.name).to.equal(name);
        });
    });

    it('should return the original category if one exists', () => {
      const name = 'my awesome category';

      let fixture;
      return Category.create({ name })
        .then(category => {
          fixture = category;
        })
        .then(() => getCategory(name))
        .then(category => {
          expect(category._id).to.deep.equal(fixture._id);
        });
    });
  });

  describe('findAndUpdateAisleLocation', () => {
    afterEach(() => AisleLocation.deleteMany());

    const category = '000000000000000000000001';
    const store = '111111111111111111111111';

    it('should add aisle information if it is provided', () => {
      return AisleLocation.create({ category, store })
        .then(() => findAndUpdateAisleLocation(store, category, '12'))
        .then(aisleLocation => {
          expect(aisleLocation.toObject()).to.include.key('aisleNo');
          expect(aisleLocation.aisleNo).to.equal('12');
        });
    });

    it('should not invalidate existing aisle info', () => {
      return AisleLocation.create({ category, store, aisleNo: '12' })
        .then(() => findAndUpdateAisleLocation(store, category))
        .then(aisleLocation => {
          expect(aisleLocation.toObject()).to.include.key('aisleNo');
          expect(aisleLocation.aisleNo).to.equal('12');
        });
    });
  });
});
