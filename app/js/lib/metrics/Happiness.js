(function () {
  'use strict';

  var getRandomInt = require('../convert/getRandomInt'),
    MIN_STARTING_HAPPINESS = 60,
    MAX_STARTING_HAPPINESS = 75;

  function Happiness(initial) {
    this.value = initial || this.setInitialValue();
  }

  Happiness.prototype = {

    /**
     * @method setInitialValue
     * @return {Number}
     */
    setInitialValue: function () {
      this.value = getRandomInt(MIN_STARTING_HAPPINESS, MAX_STARTING_HAPPINESS);
      return this.value;
    }
  };

  module.exports = Happiness;

}());
