(function () {
  'use strict';

  var Happiness = require('../metrics/Happiness'),
    TurnManager = require('../TurnManager'),
    getRandomInt = require('../convert/getRandomInt');

  function Person(params) {
    params = params || {};
    var range = params.lifespanRange;

    Object.assign(this, {
      createdAt: TurnManager.getSnapshot(),
      happiness: new Happiness(),
      lifespan: (range ? getRandomInt(range.from, range.to) : 0),
      type: params.key
    });
  }
  module.exports = Person;

}());
