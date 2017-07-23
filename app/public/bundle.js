(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
(function () {
  'use strict';

  var townsApp = require('./towns/towns.module'),
    dependencies,
    app;

  dependencies = [
    'ngRoute',
    'myApp.towns'
  ];

  app = angular.module('myApp', dependencies);

  app.config([
    '$locationProvider', '$routeProvider',
    function ($locationProvider, $routeProvider) {
      $locationProvider.hashPrefix('!');
      $routeProvider.otherwise({redirectTo: '/towns'});
    }
  ]);

  module.exports = app;

}());

},{"./towns/towns.module":2}],2:[function(require,module,exports){
(function () {
  'use strict';

  var app = angular.module('myApp.towns', [ 'ngRoute' ]),
    BuildingTypes = require('../../lib/config/BuildingTypes'),
    webworkify = require('webworkify');

  function TownsCtrl($scope) {
    var vm = this;

    vm.buildingTypes = BuildingTypes;
    vm.towns = [];
    vm.worldManager = webworkify(require('../../lib/WorldManager'));

    vm.worldManager.addEventListener('message', function (e) {
      $scope.$evalAsync(function () {
        vm.towns = e.data.towns;
        vm.turnManager = e.data.turnManager;
        console.log('towns', vm.towns);
      });
    });

    /**
     * @method setNextTurnAndUpdate
     */
    vm.setNextTurnAndUpdate = function () {
      vm.worldManager.postMessage(['update']);
    };

    vm.startBuilding = function (townId, buildingType) {
      vm.worldManager.postMessage(['startBuilding', townId, buildingType]);
    };

    vm.destroyBuilding = function (townId, building) {
      vm.worldManager.postMessage(['destroyBuilding', townId, building]);
    };

    /**
     * @method buildNewTorn
     */
    vm.buildNewTown = function () {
      vm.worldManager.postMessage(['add']);
    };

    vm.buildNewTown();
    vm.buildNewTown();
  }

  app.controller('TownsCtrl', TownsCtrl);

  app.config(['$routeProvider', function ($routeProvider) {
    $routeProvider.when('/towns', {
      templateUrl: 'js/angular/towns/towns.html',
      controller: 'TownsCtrl as vm'
    });
  }]);

  module.exports = app;

}());

},{"../../lib/WorldManager":4,"../../lib/config/BuildingTypes":5,"webworkify":15}],3:[function(require,module,exports){
(function () {
  'use strict';

  var YEAR_MULTIPLIER = 0.25, // 1 turn === 0.25 of year === season
    floor = require('./convert/floor'),
    TurnManager;

  TurnManager = {
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

},{"./convert/floor":7}],4:[function(require,module,exports){
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

},{"./TurnManager":3,"./towns/Town":13}],5:[function(require,module,exports){
(function () {
  'use strict';

  module.exports = {
    'radio tower': {
      name: 'Radio Tower',
      id: 'b-1',
      amountToBuild: 50,
      dependsOn: null,
      mutators: {
        local: [
          {
            to: 'population',
            by: 0.2
          },
          {
            to: 'happiness',
            by: 5,
            buff: true
          }
        ],
        global: [
          {
            to: 'happiness',
            by: 2,
            buff: true
          }
        ]
      }
    },
    'granary': {
      name: 'Granary',
      id: 'b-2',
      amountToBuild: 34,
      dependsOn: null,
      mutators: {
        local: [
          {
            to: 'food',
            by: 0.1
          }
        ],
        global: []
      }
    },
    'refinery': {
      name: 'Refinery',
      id: 'b-3',
      amountToBuild: 20,
      dependsOn: null,
      mutators: {
        local: [
          {
            to: 'work',
            by: 1.5,
            buff: true
          }
        ],
        global: []
      }
    }
  };

}());

},{}],6:[function(require,module,exports){
(function () {
  'use strict';

  module.exports = {
    child: {
      production: false,
      fertility: false,
      size: {
        from: 0,
        to: 3
      },
      lifespan: {
        from: 13,
        to: 16
      }
    },
    youngAdult: {
      production: {
        from: 0.4,
        to: 0.5
      },
      fertility: {
        from: 0.1,
        to: 0.1
      },
      size: {
        from: 3,
        to: 5
      },
      lifespan: {
        from: 1,
        to: 3
      }
    },
    adult: {
      production: {
        from: 0.7,
        to: 0.8
      },
      fertility: {
        from: 0.5,
        to: 0.7
      },
      size: {
        from: 3,
        to: 10
      },
      lifespan: {
        from: 40,
        to: 45
      }
    },
    old: {
      production: {
        from: 0.3,
        to: 0.5
      },
      fertility: {
        from: 0.1,
        to: 0.3
      },
      size: {
        from: 0,
        to: 6
      },
      lifespan: {
        from: 20,
        to: 30
      }
    }
  };
}());

},{}],7:[function(require,module,exports){
(function () {
  'use strict';

  function floor(value, isFloored) {
    isFloored = isFloored !== undefined ? isFloored : true;
    return isFloored ? Math.floor(value) : value;
  }

  module.exports = floor;

}());

},{}],8:[function(require,module,exports){
(function () {
  'use strict';

  function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min
  }

  module.exports = getRandomInt;

}());

},{}],9:[function(require,module,exports){
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

},{"../convert/getRandomInt":8}],10:[function(require,module,exports){
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

},{"../TurnManager":3,"../convert/floor":7,"./Person":11}],11:[function(require,module,exports){
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

},{"../TurnManager":3,"../convert/getRandomInt":8,"../metrics/Happiness":9}],12:[function(require,module,exports){
(function () {
  'use strict';

  var Demographic = require('./Demographic'),
    DemographicTypes = require('../config/DemographicTypes'),
    getRandomInt = require('../convert/getRandomInt'),
    forEach = require('../util/forEach');

  function Population(params) {
    params = params || {};
    var demographics = params.demographics || {},
      self = this;

    this.demographics = {};
    forEach(DemographicTypes, function (type, key) {
      self.demographics[key] = self.createDemographicFrom(type, demographics[key], key);
    });
  }

  Population.prototype = {
    demographics: null,

    /**
     * @method createDemographicFrom
     * @param {Object} source
     * @param {Object} params
     * @param {Object} key
     * @return {Object}
     */
    createDemographicFrom: function (source, params, key) {
      params = params || {};
      var size = source.size,
        production = source.production,
        fertility = source.fertility;

      return new Demographic({
        key: key,
        production: params.production || (production ? getRandomInt(production.from, production.to) : 0),
        fertility: params.fertility || (fertility ? getRandomInt(fertility.from, fertility.to) : 0),
        size: params.size || (size ? getRandomInt(size.from, size.to) : 0),
        lifespanRange: params.lifespan || source.lifespan
      });
    },

    /**
     * @method growNextDemographicBy
     * @param {Object} demographic
     * @param {Number} growBy
     */
    growNextDemographicBy: function (demographic, growBy) {
      var key = demographic.key,
        createFrom;

      if (key === 'child') {
        createFrom = 'youngAdult';
      } else if (key === 'youngAdult') {
        createFrom = 'adult';
      } else if (key === 'adult') {
        createFrom = 'old';
      }
      this.demographics[createFrom].add(growBy);
    },

    /**
     * @method getTotalProduction
     * @return {Number}
     */
    getTotalProduction: function () {
      var total = 0;

      forEach(this.demographics, function (demographic) {
        total += demographic.getTotalProduction();
      });
      return total;
    },

    /**
     * @method update
     * @description Move any demographic that has grown too old to the next one (or 'killing' them off)
     *
     */
    update: function () {
      forEach(this.demographics, function (demographic) {
        demographic.update(this.growNextDemographicBy.bind(this));
      }, this);
    },

    /**
     * @method add
     * @param {Number} buffBy
     */
    add: function (buffBy) {
      console.log('buff population by', buffBy);
      // @todo buff a random, non child demographic by `buffBy`
      var random = getRandomInt(0, 2),
        demographics = this.demographics;

      console.log('random', random);
      switch (random) {
        case 0:
          return demographics.youngAdult.increment(buffBy);
        case 1:
          return demographics.adult.increment(buffBy);
        case 2:
          return demographics.old.increment(buffBy);
      }
    }
  };

  module.exports = Population;

}());

},{"../config/DemographicTypes":6,"../convert/getRandomInt":8,"../util/forEach":14,"./Demographic":10}],13:[function(require,module,exports){
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

},{"../TurnManager":3,"../convert/getRandomInt":8,"../util/forEach":14,"./Population":12}],14:[function(require,module,exports){
(function () {
  'use strict';

  function forEach(object, callback, scope) {
    var property;
    for (property in object) {
      if (object.hasOwnProperty(property)) {
        callback.call(scope, object[property], property);
      }
    }
  }

  module.exports = forEach;

}());

},{}],15:[function(require,module,exports){
var bundleFn = arguments[3];
var sources = arguments[4];
var cache = arguments[5];

var stringify = JSON.stringify;

module.exports = function (fn, options) {
    var wkey;
    var cacheKeys = Object.keys(cache);

    for (var i = 0, l = cacheKeys.length; i < l; i++) {
        var key = cacheKeys[i];
        var exp = cache[key].exports;
        // Using babel as a transpiler to use esmodule, the export will always
        // be an object with the default export as a property of it. To ensure
        // the existing api and babel esmodule exports are both supported we
        // check for both
        if (exp === fn || exp && exp.default === fn) {
            wkey = key;
            break;
        }
    }

    if (!wkey) {
        wkey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);
        var wcache = {};
        for (var i = 0, l = cacheKeys.length; i < l; i++) {
            var key = cacheKeys[i];
            wcache[key] = key;
        }
        sources[wkey] = [
            Function(['require','module','exports'], '(' + fn + ')(self)'),
            wcache
        ];
    }
    var skey = Math.floor(Math.pow(16, 8) * Math.random()).toString(16);

    var scache = {}; scache[wkey] = wkey;
    sources[skey] = [
        Function(['require'], (
            // try to call default if defined to also support babel esmodule
            // exports
            'var f = require(' + stringify(wkey) + ');' +
            '(f.default ? f.default : f)(self);'
        )),
        scache
    ];

    var workerSources = {};
    resolveSources(skey);

    function resolveSources(key) {
        workerSources[key] = true;

        for (var depPath in sources[key][1]) {
            var depKey = sources[key][1][depPath];
            if (!workerSources[depKey]) {
                resolveSources(depKey);
            }
        }
    }

    var src = '(' + bundleFn + ')({'
        + Object.keys(workerSources).map(function (key) {
            return stringify(key) + ':['
                + sources[key][0]
                + ',' + stringify(sources[key][1]) + ']'
            ;
        }).join(',')
        + '},{},[' + stringify(skey) + '])'
    ;

    var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;

    var blob = new Blob([src], { type: 'text/javascript' });
    if (options && options.bare) { return blob; }
    var workerUrl = URL.createObjectURL(blob);
    var worker = new Worker(workerUrl);
    worker.objectURL = workerUrl;
    return worker;
};

},{}],16:[function(require,module,exports){
(function () {
  'use strict';

  var angular = require('./angular/app');
  console.log('angular', angular);

}());

},{"./angular/app":1}]},{},[16]);
