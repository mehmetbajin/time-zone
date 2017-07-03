(function () {
  'use strict';

  angular
    .module('app.core')
    .directive('msResponsiveTable', msResponsiveTableDirective);

  /* istanbul ignore next */
  /** @ngInject */
  function msResponsiveTableDirective() {
    return {
      restrict: 'A',
      link: function (scope, iElement) {
        var wrapper = angular.element('<div class="ms-responsive-table-wrapper"></div>');
        iElement.after(wrapper);
        wrapper.append(iElement);
      }
    };
  }
})();
