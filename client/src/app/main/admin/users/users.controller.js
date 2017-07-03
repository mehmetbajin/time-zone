(function () {
  'use strict';

  angular
    .module('app.main.admin.users')
    .controller('UsersController', UsersController);

  /** @ngInject */
  function UsersController($rootScope, $mdDialog, $state, Util, User, Auth, Session, users) {
    var vm = this;

    // Data

    vm.user = Session.get();
    vm.users = users;

    vm.filters = {
      role: {
        '10': true,
        '20': true,
        '99': true
      },
      name: null
    };

    // Methods

    vm.filter = filter;
    vm.filtered = filtered;

    vm.edit = edit;

    //////////

    function filter(user) {
      var n = _.toLower(user.name);
      var q = _.toLower(vm.filters.name || '');
      return (!!vm.filters.role[user.role]) &&
        (_.isEmpty(q) || _.includes(n, q) || _.includes(q, n));
    }

    function filtered() {
      return _.filter(vm.users, filter);
    }

    function edit($event, user) {
      if ($rootScope.loadingProgress) {
        return;
      }

      var original = _.clone(user);

      var dialog = {
        controller: 'UserEditController as vm',
        templateUrl: 'app/main/admin/users/edit/edit.html',
        parent: angular.element('body'),
        targetEvent: $event,
        clickOutsideToClose: true,
        locals: {
          user: user
        }
      };

      $mdDialog.show(dialog)
        .then(function (user) {
          $rootScope.loadingProgress = true;
          if (user === null) {
            return User.remove(original);
          } else if (original === null) {
            return User.create(user, user.password);
          } else {
            return User.update(user);
          }
        })
        .then(function (user) {
          if (user === null) {
            _.pullAt(vm.users, _.findIndex(vm.users, ['_id', original._id]));
            Util.toast('User removed.');
          } else if (original === null) {
            vm.users.push(user);
            Util.toast('User added.');
          } else {
            _.assign(vm.users[_.findIndex(vm.users, ['_id', original._id])], user);
            Util.toast('User updated.');
          }

          // Must logout when current user's role changes since he may have lost privileges.
          if (original &&
            original._id === vm.user._id &&
            user.role !== vm.user.role) {
            logout();
          }
        })
        .catch(Util.toast)
        .finally(function () {
          $rootScope.loadingProgress = false;
        });
    }

    function logout() {
      Auth.logout()
        .then(function () {
          $state.go('app.main_pages_login');
        });
    }
  }
})();
