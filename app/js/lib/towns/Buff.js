(function () {
  'use strict';

  function Buff() {
    this.buffs = [];

    /**
     * @method total
     * @return {Boolean}
     */
    this.total = function () {
      var total = 0;
      this.buffs.forEach(function (b) {
        total += b.buff;
      });
      return total;
    };

    /**
     * @method getAll
     * @return {Array}
     */
    this.getAll = function () {
      return this.buffs;
    };

    /**
     * @method get
     * @param {Boolean} townId
     * @return {Object}
     */
    this.get = function (townId) {
      return this.buffs.find(function (v) {
        return v.townId === townId;
      });
    };

    /**
     * @method set
     * @param {Number} townId
     * @param {Number} buff
     */
    this.set = function (townId, buff) {
      var index = this.buffs.findIndex(function (v) {
        return v.townId === townId;
      });

      if (index > -1) {
        this.buffs[index] = { townId: townId, buff: buff };
      }

      this.buffs.push({
        townId: townId,
        buff: buff
      });
    };

  }

  module.exports = Buff;

}());
