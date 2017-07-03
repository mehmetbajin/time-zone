(function () {
  'use strict';

  angular
    .module('app.main.pages.register')
    .controller('RegisterController', RegisterController);

  /** @ngInject */
  function RegisterController($state, Util, Auth, User) {
    var vm = this;

    // Data

    vm.working = false;

    vm.user = {
      name: '',
      email: '',
      password: ''
    };

    // Methods

    vm.register = register;

    //////////

    function register(user) {
      vm.working = true;

      User.create(user, user.password)
        .then(function () {
          return Auth.login(user.email, user.password);
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
