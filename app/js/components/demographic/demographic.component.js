(function () {
  'use strict';

  angular.module('myApp')
    .component('demographic', {
      bindings: {
        demographic: '<',
        label: '@'
      },
      template: '<strong><span ng-bind="$ctrl.label"></span>: <span ng-bind="$ctrl.demographic.size.length"></span></strong>'
    });

}());
