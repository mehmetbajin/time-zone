(function () {
  'use strict';

  angular
    .module('app.main.pages.login')
    .controller('LoginController', LoginController);

  /** @ngInject */
  function LoginController($state, Util, Auth) {
    var vm = this;

    // Data

    vm.working = false;

    vm.user = {
      email: '',
      password: ''
    };

    // Methods

    vm.login = login;

    //////////

    function login(user) {
      vm.working = true;

      Auth.login(user.email, user.password)
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
