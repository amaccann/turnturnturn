(function () {
  'use strict';

  var Demographic = require('./Demographic'),
    DemographicTypes = require('../config/DemographicTypes'),
    TurnManager = require('../TurnManager'),
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
        work = source.work,
        fertility = source.fertility;

      return new Demographic({
        key: key,
        work: params.work || (work ? getRandomInt(work.from, work.to) : 0),
        fertility: params.fertility || (fertility ? getRandomInt(fertility.from, fertility.to) : 0),
        size: params.size || (size ? getRandomInt(size.from, size.to) : 0),
        lifespanRange: params.lifespan || source.lifespan
      });
    },

    growNextDemographicBy: function (demographic, by) {
      var key = demographic.key,
        createFrom;

      if (key === 'child') {
        createFrom = 'youngAdult';
      } else if (key === 'youngAdult') {
        createFrom = 'adult';
      } else if (key === 'adult') {
        createFrom = 'old';
      }
      this.demographics[createFrom].add(by);
    },

    /**
     * @TODO remove this at some point, town.setStatisticTotals() needs it
     */
    get: function () {
      return 0;
    },

    /**
     * @method getAll
     * @return {Object}
     */
    getAll: function () {
      return this.demographics;
    },

    /**
     * @method getTotalWork
     * @return {Number}
     */
    getTotalWork: function () {
      var total = 0;

      forEach(this.demographics, function (demographic) {
        total += demographic.getTotalWork();
      });
      return total;
    },

    /**
     * @method update
     * @description Move any demographic that has grown too old to the next one (or 'killing' them off)
     *
     */
    update: function () {
      var snapshot = TurnManager.getSnapshot(),
        currentYear = snapshot.year,
        oldLength = 0,
        newLength = 0;

      forEach(this.demographics, function (demographic) {
        oldLength = demographic.size.length;
        demographic.size = demographic.size.filter(function (value) {
          return (currentYear - value.createdAt.year) <= value.lifespan;
        });
        newLength = demographic.size.length;
        if (oldLength > newLength && demographic.key !== 'old') {
          this.growNextDemographicBy(demographic, (oldLength - newLength));
        }
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
