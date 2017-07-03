(function () {
  'use strict';

  angular
    .module('app.main.pages.password-set', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider
      .state('app.main_pages_password-set', {
        url: '/main/pages/password-set?oobCode',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/content-only.html',
            controller: 'MainController as vm'
          },
          'content@app.main_pages_password-set': {
            templateUrl: 'app/main/pages/password-set/password-set.html',
            controller: 'PasswordSetController as vm'
          }
        },
        data: {
          permissions: {
            only: ['UNAUTHENTICATED'],
            redirectTo: 'app.main_account_profile'
          }
        },
        bodyClass: 'app-main-pages-password-set'
      });
  }
})();
