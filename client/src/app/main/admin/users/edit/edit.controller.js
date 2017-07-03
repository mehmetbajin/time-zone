(function () {
  'use strict';

  angular
    .module('app.main.admin.users')
    .controller('UserEditController', UserEditController);

  /** @ngInject */
  function UserEditController($mdDialog, user) {
    var vm = this;

    // Data

    vm.editing = !!user;

    vm.user = vm.editing ? _.clone(user) : {
      role: null,
      name: '',
      email: '',
      password: ''
    };

    // Methods

    vm.cancel = cancel;
    vm.remove = remove;
    vm.ok = ok;

    //////////

    function cancel() {
      $mdDialog.cancel();
    }

    function remove() {
      $mdDialog.hide(null);
    }

    function ok() {
      $mdDialog.hide(vm.user);
    }
  }
})();
