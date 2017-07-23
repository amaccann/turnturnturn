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
