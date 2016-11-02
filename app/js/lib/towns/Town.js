(function () {
  'use strict';

  var Buff = require('./Buff'),
    Building = require('./Building'),
    Statistic = require('./Statistic'),
    Population = require('./Population'),
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

    this.init();
  }

  Town.prototype = {
    name: '',
    id: null,
    startedAt: null,

    /**
     * @method resetStatistics
     * @TODO - Make population 'demographics', break city into child-young-adult-old etc.
     */
    resetStatistics: function () {
      this.stats = {
        food: new Statistic(getRandomInt(45, 60)),
        population: new Population(),
        work: new Statistic(0),
        disease: new Statistic(getRandomInt(10, 20)),
        happiness: new Statistic(getRandomInt(50, 65)),
        wealth: new Statistic()
      };
    },

    /**
     * @method resetBuffs
     */
    resetBuffs: function () {
      this.buffs = {
        food: new Buff(),
        population: new Buff(),
        work: new Buff(),
        disease: new Buff(),
        happiness: new Buff()
      };
    },

    /**
     * @method init
     */
    init: function () {
      this.resetStatistics();
      this.resetBuffs();
      this.setStatisticTotals();
      this.update([]);
    },

    /**
     * @method isBuildingInProgress
     * @param {Number} buildingId
     * @return {Boolean}
     */
    isBuildingInProgress: function (buildingId) {
      return this.buildings.find(function (b) { return b.id === buildingId; });
    },

    /**
     * @method build
     * @param {Object} buildingParams
     */
    build: function (buildingParams) {
      var alreadyBuilt,
        building;

      if (!buildingParams) {
        return;
      }

      alreadyBuilt = this.isBuildingInProgress(buildingParams.id);
      if (alreadyBuilt) {
        return console.error(buildingParams.name, 'is already built or in progress');
      }

      building = new Building(this, buildingParams);
      this.buildings.push(building);
    },

    /**
     * @method setToDestroy
     * @param {Object} building
     */
    setToDestroy: function (building) {
      building = this.buildings.find(function (b) {
        return b.id === building.id;
      });
      building.destroy();

      this.buildings = this.buildings.filter(function (b) {
        return b.id !== building.id;
      });
      this.update([]);
    },

    /**
     * @method update
     * @param {Array} otherTowns
     */
    update: function (otherTowns) {
      var otherTownsBuildings;

      this.resetBuffs();
      this.stats.population.update();
      this.stats.work.set(this.stats.population.getTotalWork());
      console.info('work produced by', this.id, this.stats.work);

      //@TODO - Fix otherbuilding mutators to pass back in owner town to .update(otherbuildingsTown)

      // otherTownsBuildings = otherTowns.map(function (town) {
      //   return town.buildings;
      // });
      // otherTownsBuildings = ([]).concat.apply([], otherTownsBuildings);
      //
      // otherTownsBuildings.forEach(function (building) {
      //   building.update(this);
      //   if (building.isFinished()) {
      //     this.updateStatistics(building.belongsTo, building.mutators.global);
      //   }
      // }, this);

      this.buildings.forEach(function (building) {
        building.update(this);
        if (building.isFinished()) {
          this.updateStatistics(building.belongsTo, building.mutators.local);
        }
      }, this);

      this.setStatisticTotals();
    },

    /**
     * @method updateStatistics
     * @param {Number} belongsTo
     * @param {Array} mutators
     */
    updateStatistics: function (belongsTo, mutators) {
      var self = this;

      mutators.forEach(function (mutator) {
        if (mutator.buff) {
          self.buffs[mutator.to].set(belongsTo, mutator.by);
        } else {
          self.stats[mutator.to].add(mutator.by);
        }
      });
    },

    /**
     * @method setStatisticTotals
     * @description Calculate stats totals, including the various buffs
     */
    setStatisticTotals: function () {
      var totals = {},
        buff;

      forEach(this.stats, function (value, key) {
        buff = this.buffs[key];
        totals[key] = value.get() + (buff ? buff.total() : 0);
      }, this);
      this.totals = totals;
    }

  };

  module.exports = Town;

}());
