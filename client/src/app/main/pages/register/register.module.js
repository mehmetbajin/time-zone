(function () {
  'use strict';

  angular
    .module('app.main.pages.register', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider
      .state('app.main_pages_register', {
        url: '/main/pages/register',
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/content-only.html',
            controller: 'MainController as vm'
          },
          'content@app.main_pages_register': {
            templateUrl: 'app/main/pages/register/register.html',
            controller: 'RegisterController as vm'
          }
        },
        data: {
          permissions: {
            only: ['UNAUTHENTICATED'],
            redirectTo: 'app.main_account_profile'
          }
        },
        bodyClass: 'app-main-pages-register'
      });
  }
})();
