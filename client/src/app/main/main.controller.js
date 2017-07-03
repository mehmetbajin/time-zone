(function () {
  'use strict';

  angular
    .module('app')
    .controller('MainController', MainController);

  /** @ngInject */
  function MainController($scope, $rootScope) {
    // Data

    // Methods

    //////////

    init();

    function init() {
      var vcaeEvent = $scope.$on('$viewContentAnimationEnded', function (event) {
        if (event.targetScope.$id === $scope.$id) {
          $rootScope.$broadcast('msSplashScreen::remove');
        }
      });

      $scope.$on('$destroy', function () {
        vcaeEvent();
      });
    }
  }
})();
