(function () {
  'use strict';

  var floor = require('../convert/floor'),
    TurnManager = require('../TurnManager'),
    getRandomInt = require('../convert/getRandomInt');

  function Demographic(params) {
    params = params || {};
    Object.assign(this, params);

    this.addNew = 0;
    this.size = [];
    this.add(params.size);
  }

  Demographic.prototype = {
    age: 0,
    fertility: 0,
    work: 0,
    lifespan: 0,
    size: 0,

    /**
     * @method getAge
     * @return {Number}
     */
    getAge: function () {
      return floor(this.age);
    },

    /**
     * @method getSize
     * @return {Number}
     */
    getSize: function () {
      return this.size.length;
    },

    /**
     * @method getTotalWork
     * @return {Number}
     */
    getTotalWork: function () {
      var totalWork = this.work * this.size.length;
      return floor(totalWork);
    },

    /**
     * @method increment
     * @param {Number} by
     */
    increment: function (by) {
      this.addNew += by || 0;
      if (this.addNew >= 1) {
        this.add(1);
        this.addNew = 0;
      }
    },
    /**
     * @method add
     * @param {Number} addBy
     */
    add: function (addBy) {
      var i = 0,
        range = this.lifespanRange;

      for (i; i < addBy; i += 1) {
        this.size.push({
          createdAt: TurnManager.getSnapshot(),
          lifespan: (range ? getRandomInt(range.from, range.to) : 0)
        });
      }
    }
  };

  module.exports = Demographic;

}());
