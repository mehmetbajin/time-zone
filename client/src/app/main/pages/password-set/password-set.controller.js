(function () {
  'use strict';

  angular
    .module('app.main.pages.password-set')
    .controller('PasswordSetController', PasswordSetController);

  /** @ngInject */
  function PasswordSetController($state, $stateParams, Util, Auth) {
    var vm = this;

    // Data

    vm.working = false;

    vm.user = {
      password: ''
    };

    vm.oobCode = $stateParams.oobCode;

    // Methods

    vm.passwordSet = passwordSet;

    //////////

    function passwordSet(user) {
      vm.working = true;

      Auth.passwordSet($stateParams.oobCode, user.password)
        .then(function (email) {
          return Auth.login(email, user.password);
        })
        .then(function () {
          $state.go('app.main_account_profile');
        })
        .catch(function (error) {
          Util.toast(error);
          vm.working = false;
        });
    }
  }
})();
