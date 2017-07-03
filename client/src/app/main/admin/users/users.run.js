(function () {
  'use strict';

  angular
    .module('app.main.admin.users')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, PermRoleStore, msNavigationService, eventCode) {
    var loggedInEvent = $rootScope.$on(eventCode.LOGGED_IN, toggleMenu);
    var loggedOutEvent = $rootScope.$on(eventCode.LOGGED_OUT, toggleMenu);

    function toggleMenu() {
      var roles = PermRoleStore.getStore();
      if (roles['MANAGER'] || roles['ADMIN']) {
        msNavigationService.saveItem('app_main_admin.users', {
          title: 'Users',
          icon: 'icon-account-multiple',
          state: 'app.main_admin_users',
          weight: 2
        });
      } else {
        msNavigationService.deleteItem('app_main_admin.users');
      }
    }

    $rootScope.$on('$destroy', function () {
      loggedInEvent();
      loggedOutEvent();
    });
  }
})();
