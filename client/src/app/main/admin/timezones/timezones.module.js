(function () {
  'use strict';

  angular
    .module('app.main.admin.timezones', [])
    .config(config);

  /** @ngInject */
  function config($stateProvider, msNavigationServiceProvider) {
    $stateProvider
      .state('app.main_admin_timezones', {
        url: '/main/admin/timezones',
        views: {
          'content@app': {
            templateUrl: 'app/main/admin/timezones/timezones.html',
            controller: 'TimezonesController as vm'
          }
        },
        resolve: {
          timezones: /* istanbul ignore next */ function (Timezone) {
            return Timezone.getEvery();
          },
          cities: /* istanbul ignore next */ function (City) {
            return City.get();
          },
          codes: /* istanbul ignore next */ function (Code) {
            return Code.get();
          },
          users: /* istanbul ignore next */ function ($q, Session, User) {
            if (Session.isAdmin()) {
              return User.getEvery();
            } else {
              return $q.resolve([]);
            }
          }
        },
        data: {
          permissions: {
            only: ['USER', 'MANAGER', 'ADMIN'],
            redirectTo: 'app.main_pages_login'
          }
        },
        bodyClass: 'app-main-admin-timezones'
      });

    msNavigationServiceProvider.saveItem('app_main_admin.timezones', {
      title: 'Timezones',
      icon: 'icon-clock',
      state: 'app.main_admin_timezones',
      weight: 1
    });
  }
})();
