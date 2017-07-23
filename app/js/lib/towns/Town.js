(function () {
  'use strict';

  var Population = require('./Population'),
    TurnManager = require('../TurnManager'),
    forEach = require('../util/forEach'),
    getRandomInt = require('../convert/getRandomInt');

  function setId() {
    return Math.floor(Math.random() * 100000000);
  }

  function Town() {
    this.buildings = [];
    this.id = setId();
    this.startedAt = TurnManager.getTurn();
    this.stats = {
      buffs: null,
      disease: null,
      food: null,
      population: new Population(),
      production: null
    };
    this.init();
  }

  Town.prototype = {
    name: '',
    id: null,
    startedAt: null,

    /**
     * @method init
     */
    init: function () {
      this.update();
    },

    /**
     * @method update
     */
    update: function () {
      this.stats.population.update();
      this.stats.production = this.stats.population.getTotalProduction();
    }

  };

  module.exports = Town;

}());
