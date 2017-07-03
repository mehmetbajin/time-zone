(function () {
  'use strict';

  angular
    .module('app.main.account.profile')
    .controller('ProfileController', ProfileController);

  /** @ngInject */
  function ProfileController(user) {
    var vm = this;

    // Data

    vm.user = user;

    // Methods

    //////////
  }
})();
