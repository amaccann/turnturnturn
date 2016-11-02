(function () {
  'use strict';

  var Town = require('./towns/Town'),
    TurnManager = require('./TurnManager'),
    manager;

  function WorldManager() {
    this.towns = [];
    this.turnManager = TurnManager;
  }

  WorldManager.prototype = {

    /**
     * @method toPlain
     * @return {Object}
     */
    toPlain: function () {
      return JSON.parse(JSON.stringify(this));
    },

    /**
     * @method add
     * @return {Object}
     */
    add: function () {
      this.towns.push(new Town());
      return this.toPlain();
    },

    /**
     * @method find
     * @param {Number} townId
     * @return {Object}
     */
    find: function (townId) {
      return this.towns.find(function (t) {
        return t.id === townId;
      });
    },

    /**
     * @method startBuilding
     * @param {Array} params
     * @return {Object}
     */
    startBuilding: function (params) {
      var townId = params[0],
        buildingType = params[1],
        town = this.find(townId);

      if (town) {
        town.build(buildingType);
      }
      return this.toPlain();
    },

    /**
     * @method destroyBuilding
     * @param {Array} params
     * @return {Object}
     */
    destroyBuilding: function (params) {
      var townId = params[0],
        building = params[1],
        town = this.find(townId);

      if (town) {
        town.setToDestroy(building);
      }
      return this.toPlain();
    },

    /**
     * @method update
     * @return {Object}
     */
    update: function () {
      var filtered;
      TurnManager.setNextTurn();

      this.towns.forEach(function (town) {
        filtered = this.towns.filter(function (t) { return t.id !== town.id; });
        town.update(filtered);
      }, this);
      return this.toPlain();
    }
  };

  manager = new WorldManager();

  module.exports = function (self) {
    self.postMessage(manager.toPlain());

    self.addEventListener('message', function (e) {
      var params = e.data,
        action = params[0];

      params.shift();
      switch (action) {
        case 'add':
          return self.postMessage(manager.add());
        case 'update':
          return self.postMessage(manager.update());
        case 'startBuilding':
          return self.postMessage(manager.startBuilding(params));
        case 'destroyBuilding':
          return self.postMessage(manager.destroyBuilding(params));
      }
    });
  };

}());
