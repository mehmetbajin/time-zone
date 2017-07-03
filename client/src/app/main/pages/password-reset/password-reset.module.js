(function () {
  'use strict';

  angular
    .module('app.main.pages.password-reset', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider
      .state('app.main_pages_password-reset', {
        url: '/main/pages/password-reset',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/content-only.html',
            controller: 'MainController as vm'
          },
          'content@app.main_pages_password-reset': {
            templateUrl: 'app/main/pages/password-reset/password-reset.html',
            controller: 'PasswordResetController as vm'
          }
        },
        data: {
          permissions: {
            only: ['UNAUTHENTICATED'],
            redirectTo: 'app.main_account_profile'
          }
        },
        bodyClass: 'app-main-pages-password-reset'
      });
  }
})();
