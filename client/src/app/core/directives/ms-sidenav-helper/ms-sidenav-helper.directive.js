(function () {
  'use strict';

  angular
    .module('app.core')
    .directive('msSidenavHelper', msSidenavHelperDirective);

  /* istanbul ignore next */
  /** @ngInject */
  function msSidenavHelperDirective() {
    return {
      restrict: 'A',
      require: '^mdSidenav',
      link: function (scope, iElement, iAttrs, MdSidenavCtrl) {
        scope.$watch(function () {
          return MdSidenavCtrl.isOpen() && !MdSidenavCtrl.isLockedOpen();
        }, function (current) {
          if (angular.isDefined(current)) {
            iElement.parent().toggleClass('full-height', current);
            angular.element('html').toggleClass('sidenav-open', current);
          }
        });
      }
    };
  }
})();
