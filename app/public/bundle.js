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

},{"../../lib/WorldManager":4,"../../lib/config/BuildingTypes":5,"webworkify":16}],3:[function(require,module,exports){
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

},{"./TurnManager":3,"./towns/Town":14}],5:[function(require,module,exports){
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
      work: false,
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
      work: {
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
        from: 2,
        to: 2
      }
    },
    adult: {
      work: {
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
      work: {
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

},{}],10:[function(require,module,exports){
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

},{"../TurnManager":3}],11:[function(require,module,exports){
(function () {
  'use strict';

  var floor = require('../convert/floor'),
    TurnManager = require('../TurnManager'),
    getRandomInt = require('../convert/getRandomInt');

  function Demographic(params) {
    params = params || {};
    Object.assign(this, params);

    this.addNew = 0;
    this.size = [];
    this.add(params.size);
  }

  Demographic.prototype = {
    age: 0,
    fertility: 0,
    work: 0,
    lifespan: 0,
    size: 0,

    /**
     * @method getAge
     * @return {Number}
     */
    getAge: function () {
      return floor(this.age);
    },

    /**
     * @method getSize
     * @return {Number}
     */
    getSize: function () {
      return this.size.length;
    },

    /**
     * @method getTotalWork
     * @return {Number}
     */
    getTotalWork: function () {
      var totalWork = this.work * this.size.length;
      return floor(totalWork);
    },

    /**
     * @method increment
     * @param {Number} by
     */
    increment: function (by) {
      this.addNew += by || 0;
      if (this.addNew >= 1) {
        this.add(1);
        this.addNew = 0;
      }
    },
    /**
     * @method add
     * @param {Number} addBy
     */
    add: function (addBy) {
      var i = 0,
        range = this.lifespanRange;

      for (i; i < addBy; i += 1) {
        this.size.push({
          createdAt: TurnManager.getSnapshot(),
          lifespan: (range ? getRandomInt(range.from, range.to) : 0)
        });
      }
    }
  };

  module.exports = Demographic;

}());

},{"../TurnManager":3,"../convert/floor":7,"../convert/getRandomInt":8}],12:[function(require,module,exports){
(function () {
  'use strict';

  var Demographic = require('./Demographic'),
    DemographicTypes = require('../config/DemographicTypes'),
    TurnManager = require('../TurnManager'),
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
        work = source.work,
        fertility = source.fertility;

      return new Demographic({
        key: key,
        work: params.work || (work ? getRandomInt(work.from, work.to) : 0),
        fertility: params.fertility || (fertility ? getRandomInt(fertility.from, fertility.to) : 0),
        size: params.size || (size ? getRandomInt(size.from, size.to) : 0),
        lifespanRange: params.lifespan || source.lifespan
      });
    },

    growNextDemographicBy: function (demographic, by) {
      var key = demographic.key,
        createFrom;

      if (key === 'child') {
        createFrom = 'youngAdult';
      } else if (key === 'youngAdult') {
        createFrom = 'adult';
      } else if (key === 'adult') {
        createFrom = 'old';
      }
      this.demographics[createFrom].add(by);
    },

    /**
     * @TODO remove this at some point, town.setStatisticTotals() needs it
     */
    get: function () {
      return 0;
    },

    /**
     * @method getAll
     * @return {Object}
     */
    getAll: function () {
      return this.demographics;
    },

    /**
     * @method getTotalWork
     * @return {Number}
     */
    getTotalWork: function () {
      var total = 0;

      forEach(this.demographics, function (demographic) {
        total += demographic.getTotalWork();
      });
      return total;
    },

    /**
     * @method update
     * @description Move any demographic that has grown too old to the next one (or 'killing' them off)
     *
     */
    update: function () {
      var snapshot = TurnManager.getSnapshot(),
        currentYear = snapshot.year,
        oldLength = 0,
        newLength = 0;

      forEach(this.demographics, function (demographic) {
        oldLength = demographic.size.length;
        demographic.size = demographic.size.filter(function (value) {
          return (currentYear - value.createdAt.year) <= value.lifespan;
        });
        newLength = demographic.size.length;
        if (oldLength > newLength && demographic.key !== 'old') {
          this.growNextDemographicBy(demographic, (oldLength - newLength));
        }
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

},{"../TurnManager":3,"../config/DemographicTypes":6,"../convert/getRandomInt":8,"../util/forEach":15,"./Demographic":11}],13:[function(require,module,exports){
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

},{"../convert/floor":7}],14:[function(require,module,exports){
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

},{"../TurnManager":3,"../convert/getRandomInt":8,"../util/forEach":15,"./Buff":9,"./Building":10,"./Population":12,"./Statistic":13}],15:[function(require,module,exports){
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

},{}],16:[function(require,module,exports){
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

},{}],17:[function(require,module,exports){
(function () {
  'use strict';

  var angular = require('./angular/app');
  console.log('angular', angular);

}());

},{"./angular/app":1}]},{},[17]);
