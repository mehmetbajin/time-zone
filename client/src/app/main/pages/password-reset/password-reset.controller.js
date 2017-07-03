(function () {
  'use strict';

  angular
    .module('app.main.pages.password-reset')
    .controller('PasswordResetController', PasswordResetController);

  /** @ngInject */
  function PasswordResetController($state, Util, Auth) {
    var vm = this;

    // Data

    vm.working = false;

    vm.user = {
      email: ''
    };

    // Methods

    vm.passwordReset = passwordReset;

    //////////

    function passwordReset(user) {
      vm.working = true;

      Auth.passwordReset(user.email)
        .then(function () {
          Util.toast('Email containing the password reset link has been sent.');
        })
        .catch(Util.toast)
        .finally(function () {
          vm.working = false;
        });
    }
  }
})();
