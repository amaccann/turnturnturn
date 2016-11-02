(function () {
  'use strict';

  var floor = require('../convert/floor');

  function Statistic(initialValue) {
    this.value = initialValue || 0;

    /**
     * @method get
     * @return {Number}
     */
    this.get = function () {
      return floor(this.value);
    };

    /**
     * @method set
     * @param {Number} newValue
     * @return {Object}
     */
    this.set = function (newValue) {
      this.value = newValue || 0;
      return this;
    };

    /**
     * @method add
     * @param {Number} by
     * @return {Object}
     */
    this.add = function (by) {
      this.value += by || 0;
      return this;
    };

    /**
     * @method subtract
     * @param {Number} by
     * @return {Object}
     */
    this.subtract = function (by) {
      this.value -= by || 0;
      return this;
    };
  }

  module.exports = Statistic;

}());
