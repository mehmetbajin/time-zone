(function () {
  'use strict';

  angular
    .module('app.main.admin.users', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider) {
    $stateProvider
      .state('app.main_admin_users', {
        url: '/main/admin/users',
        views: {
          'content@app': {
            templateUrl: 'app/main/admin/users/users.html',
            controller: 'UsersController as vm'
          }
        },
        resolve: {
          users: /* istanbul ignore next */ function (User) {
            return User.getEvery();
          }
        },
        data: {
          permissions: {
            only: ['MANAGER', 'ADMIN'],
            redirectTo: 'app.main_pages_login'
          }
        },
        bodyClass: 'app-main-admin-users'
      });
  }
})();
