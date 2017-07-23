(function () {
  'use strict';

  var Demographic = require('./Demographic'),
    DemographicTypes = require('../config/DemographicTypes'),
    getRandomInt = require('../convert/getRandomInt'),
    forEach = require('../util/forEach');

  function Population(params) {
    params = params || {};
    var demographics = params.demographics || {},
      self = this;

    this.demographics = {};
    forEach(DemographicTypes, function (type, key) {
      self.demographics[key] = self.createDemographicFrom(type, demographics[key], key);
    });
  }

  Population.prototype = {
    demographics: null,

    /**
     * @method createDemographicFrom
     * @param {Object} source
     * @param {Object} params
     * @param {Object} key
     * @return {Object}
     */
    createDemographicFrom: function (source, params, key) {
      params = params || {};
      var size = source.size,
        production = source.production,
        fertility = source.fertility;

      return new Demographic({
        key: key,
        production: params.production || (production ? getRandomInt(production.from, production.to) : 0),
        fertility: params.fertility || (fertility ? getRandomInt(fertility.from, fertility.to) : 0),
        size: params.size || (size ? getRandomInt(size.from, size.to) : 0),
        lifespanRange: params.lifespan || source.lifespan
      });
    },

    /**
     * @method growNextDemographicBy
     * @param {Object} demographic
     * @param {Number} growBy
     */
    growNextDemographicBy: function (demographic, growBy) {
      var key = demographic.key,
        createFrom;

      if (key === 'child') {
        createFrom = 'youngAdult';
      } else if (key === 'youngAdult') {
        createFrom = 'adult';
      } else if (key === 'adult') {
        createFrom = 'old';
      }
      this.demographics[createFrom].add(growBy);
    },

    /**
     * @method getTotalProduction
     * @return {Number}
     */
    getTotalProduction: function () {
      var total = 0;

      forEach(this.demographics, function (demographic) {
        total += demographic.getTotalProduction();
      });
      return total;
    },

    /**
     * @method update
     * @description Move any demographic that has grown too old to the next one (or 'killing' them off)
     *
     */
    update: function () {
      forEach(this.demographics, function (demographic) {
        demographic.update(this.growNextDemographicBy.bind(this));
      }, this);
    },

    /**
     * @method add
     * @param {Number} buffBy
     */
    add: function (buffBy) {
      console.log('buff population by', buffBy);
      // @todo buff a random, non child demographic by `buffBy`
      var random = getRandomInt(0, 2),
        demographics = this.demographics;

      console.log('random', random);
      switch (random) {
        case 0:
          return demographics.youngAdult.increment(buffBy);
        case 1:
          return demographics.adult.increment(buffBy);
        case 2:
          return demographics.old.increment(buffBy);
      }
    }
  };

  module.exports = Population;

}());
