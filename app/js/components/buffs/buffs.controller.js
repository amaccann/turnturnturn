(function () {
  'use strict';

  /** @ngInject */
  function BuffsCtrl() {
    var vm = this;

    /**
     * @method $onInit
     */
    vm.$onInit = function () {
      vm.values = vm.buffs.buffs;
    };

    /**
     * @method $onChanges
     */
    vm.$onChanges = function () {
      vm.values = vm.buffs.buffs;
    };
  }

  angular.module('myApp')
    .controller('BuffsCtrl', BuffsCtrl);

}());
