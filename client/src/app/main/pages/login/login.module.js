(function () {
  'use strict';

  angular
    .module('app.main.pages.login', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider
      .state('app.main_pages_login', {
        url: '/main/pages/login',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/content-only.html',
            controller: 'MainController as vm'
          },
          'content@app.main_pages_login': {
            templateUrl: 'app/main/pages/login/login.html',
            controller: 'LoginController as vm'
          }
        },
        data: {
          permissions: {
            only: ['UNAUTHENTICATED'],
            redirectTo: 'app.main_account_profile'
          }
        },
        bodyClass: 'app-main-pages-login'
      });
  }
})();
