(function () {
  'use strict';

  angular
    .module('app')
    .run(runBlock);

  /** @ngInject */
  function runBlock($rootScope, $timeout, $q, $state, $urlRouter, Session) {
    $rootScope.state = $state;

    var stateChangeStartEvent = $rootScope.$on('$stateChangeStart', function () {
      $rootScope.loadingProgress = true;
    });

    var stateChangeSuccessEvent = $rootScope.$on('$stateChangeSuccess', function () {
      $timeout(function () {
        $rootScope.loadingProgress = false;
      });
    });

    $rootScope.$on('$destroy', function () {
      stateChangeStartEvent();
      stateChangeSuccessEvent();
    });

    Session.check()
      .finally(function () {
        $urlRouter.sync();
        $urlRouter.listen();
      });
  }
})();
