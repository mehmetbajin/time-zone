(function () {
  'use strict';

  angular
    .module('app.core')
    .directive('msSplashScreen', msSplashScreenDirective);

  /* istanbul ignore next */
  /** @ngInject */
  function msSplashScreenDirective($animate) {
    return {
      restrict: 'E',
      link: function (scope, iElement) {
        var splashScreenRemoveEvent = scope.$on('msSplashScreen::remove', function () {
          $animate.leave(iElement).then(function () {
            splashScreenRemoveEvent();
            scope = iElement = null;
          });
        });
      }
    };
  }
})();
