(function () {
  'use strict';

  angular
    .module('app')
    .config(routeConfig);

  /** @ngInject */
  function routeConfig($locationProvider, $urlRouterProvider, $stateProvider) {
    $locationProvider.html5Mode(true);

    $urlRouterProvider.deferIntercept();
    $urlRouterProvider.otherwise(function ($injector) {
      var $state = $injector.get('$state');
      $state.go('app.main_pages_login');
    });

    $stateProvider
      .state('app', {
        abstract: true,
        views: {
          'main@': {
            templateUrl: 'app/core/layouts/vertical-navigation.html',
            controller: 'MainController as vm'
          },
          'toolbar@app': {
            templateUrl: 'app/toolbar/layouts/vertical-navigation/toolbar.html',
            controller: 'ToolbarController as vm'
          },
          'navigation@app': {
            templateUrl: 'app/navigation/layouts/vertical-navigation/navigation.html',
            controller: 'NavigationController as vm'
          }
        }
      });
  }
})();
