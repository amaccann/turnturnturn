(function () {
  'use strict';

  var floor = require('../convert/floor'),
    Person = require('./Person'),
    TurnManager = require('../TurnManager');

  function Demographic(params) {
    params = params || {};
    this.key = params.key;
    this.size = [];
    this.add(params);
  }

  Demographic.prototype = {
    production: 0,
    size: 0,

    /**
     * @method getSize
     * @return {Number}
     */
    getSize: function () {
      return this.size.length;
    },

    /**
     * @method getTotalProduction
     * @return {Number}
     */
    getTotalProduction: function () {
      return this.key === 'child' ? 0 : this.size.length;
    },

    /**
     * @method add
     * @param {Number} params
     */
    add: function (params) {
      var i = 0;
      for (i; i < params.size; i += 1) {
        this.size.push(new Person(params));
      }
    },

    /**
     * @method isStillAlive
     * @param {Object} value
     * @return {Boolean}
     */
    isStillAlive: function (value) {
      var snapshot = TurnManager.getSnapshot(),
        currentYear = snapshot.year;

      return (currentYear - value.createdAt.year) <= value.lifespan;
    },

    /**
     * @method update
     * @param {Function} callback
     */
    update: function (callback) {
      var oldLength = this.size.length,
        newLength;

      this.size = this.size.filter(this.isStillAlive);
      newLength = this.size.length;

      if (callback && oldLength > newLength && this.key !== 'old') {
        callback.call(callback, this, (oldLength - newLength));
      }
    },

    kill: function () {

    }

  };

  module.exports = Demographic;

}());
