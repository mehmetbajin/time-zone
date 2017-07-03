(function () {
  'use strict';

  angular
    .module('app.main.pages', [
      'app.main.pages.login',
      'app.main.pages.password-reset',
      'app.main.pages.password-set',
      'app.main.pages.register'
    ]);
})();
