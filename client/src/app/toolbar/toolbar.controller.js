(function () {
  'use strict';

  angular
    .module('app.toolbar')
    .controller('ToolbarController', ToolbarController);

  /** @ngInject */
  function ToolbarController($scope, $state, $mdSidenav, msNavigationService, Util, Session, Auth, eventCode) {
    var vm = this;

    // Data

    vm.user = Session.get();

    // Methods

    vm.logout = logout;
    vm.toggleSidenav = toggleSidenav;
    vm.toggleMsNavigationFolded = toggleMsNavigationFolded;

    //////////

    init();

    function init() {
      var loggedInEvent = $scope.$on(eventCode.LOGGED_IN, function ($event, data) {
        vm.user = _.clone(data);
      });

      var loggedOutEvent = $scope.$on(eventCode.LOGGED_OUT, function () {
        vm.user = null;
      });

      $scope.$on('$destroy', function () {
        loggedInEvent();
        loggedOutEvent();
      });
    }

    /**
     * Signs user out.
     */
    function logout() {
      Auth.logout()
        .then(function () {
          vm.user = null;
          $state.go('app.main_pages_login');
        })
        .catch(Util.toast);
    }

    /**
     * Toggles a sidenav.
     * @param {string} sidenavId
     */
    function toggleSidenav(sidenavId) {
      $mdSidenav(sidenavId).toggle();
    }

    /**
     * Toggles navigation.
     */
    function toggleMsNavigationFolded() {
      msNavigationService.toggleFolded();
    }
  }
})();
