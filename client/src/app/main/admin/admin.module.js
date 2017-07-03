(function () {
  'use strict';

  angular
    .module('app.main.admin', [
      'app.main.admin.timezones',
      'app.main.admin.users'
    ])
    .config(config);

  /** @ngInject */
  function config(msNavigationServiceProvider) {
    msNavigationServiceProvider.saveItem('app_main_admin', {
      title: 'Admin',
      group: true,
      weight: 2
    });
  }
})();
