(function () {
  'use strict';

  angular.module('myApp')
    .component('buffs', {
      bindings: {
        buffs: '<',
        label: '<'
      },
      bindToController: true,
      controller: 'BuffsCtrl',
      templateUrl: 'js/components/buffs/buffs.html'
    });

}());
