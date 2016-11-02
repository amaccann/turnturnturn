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
