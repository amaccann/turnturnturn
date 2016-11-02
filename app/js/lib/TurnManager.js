(function () {
  'use strict';

  var YEAR_MULTIPLIER = 0.25, // 1 turn === 0.25 of year === season
    floor = require('./convert/floor');

  var TurnManager = {
    turn: 1,
    year: 1,

    getTurn: function () {
      return this.turn;
    },

    getYear: function () {
      return this.year;
    },

    setNextTurn: function (by) {
      by = by || 1;
      this.turn += by;
      this.year += (by * YEAR_MULTIPLIER);
      return this;
    },

    /**
     * @method turnsToFinish
     * @return {Number}
     */
    turnsToFinish: function (progress, total, perTurn) {
      var remaining = total - progress,
        turnsLeft = floor(remaining / perTurn);

      return turnsLeft;
    },

    /**
     * @method getSnapshot
     * @return {Object}
     */
    getSnapshot: function () {
      return {
        turn: this.turn,
        year: this.year
      };
    }
  };

  module.exports = TurnManager;

}());
