(function () {
  'use strict';

  var TurnManager = require('../TurnManager');

  function Building(town, params) {
    params = params || {};
    this.belongsTo = town.id;
    this.startedAt = TurnManager.getTurn();
    this.progress = 0;

    this.finished = false;
    this.destroyed = false;
    Object.assign(this, params);
    this.update(town);
  }

  Building.prototype = {

    /**
     * @method isFinished
     * @return {Boolean}
     */
    isFinished: function () {
      return this.finished && !this.destroyed;
    },

    /**
     * @method update
     * @param {Object} town
     */
    update: function (town) {
      var stats = town.stats;

      if (this.isFinished()) {
        return;
      }

      this.progress += stats.work.get();
      this.setFinished(town);
    },

    /**
     * @method setFinished
     */
    setFinished: function (town) {
      var stats = town.stats;

      this.finishedIn = TurnManager.turnsToFinish(this.progress, this.amountToBuild, stats.work.get());
      this.finished = this.finishedIn === 0 || (this.progress >= this.amountToBuild);

      if (this.finished && !this.finishedAt) {
        this.finishedAt = TurnManager.getSnapshot();
      }
    },

    /**
     * @method destroy
     */
    destroy: function () {
      this.destroyed = true;
    }

  };

  module.exports = Building;

}());
