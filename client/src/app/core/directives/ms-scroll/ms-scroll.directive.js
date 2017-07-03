(function () {
  'use strict';

  angular
    .module('app.core')
    .provider('msScrollConfig', msScrollConfigProvider)
    .directive('msScroll', msScrollDirective);

  /* istanbul ignore next */
  /** @ngInject */
  function msScrollConfigProvider() {
    var defaultConfiguration = {
      wheelSpeed: 1,
      wheelPropagation: false,
      swipePropagation: true,
      minScrollbarLength: null,
      maxScrollbarLength: null,
      useBothWheelAxes: false,
      useKeyboard: true,
      suppressScrollX: false,
      suppressScrollY: false,
      scrollXMarginOffset: 0,
      scrollYMarginOffset: 0,
      stopPropagationOnClick: true
    };

    // Methods

    this.config = config;

    //////////

    function config(configuration) {
      defaultConfiguration = angular.extend({}, defaultConfiguration, configuration);
    }

    this.$get = function () {
      var service = {
        getConfig: getConfig
      };

      return service;

      //////////

      function getConfig() {
        return defaultConfiguration;
      }
    };
  }

  /* istanbul ignore next */
  /** @ngInject */
  function msScrollDirective($timeout, msScrollConfig, fuseConfig) {
    return {
      restrict: 'AE',
      compile: function (tElement) {
        if (fuseConfig.getConfig('disableCustomScrollbars')) {
          return;
        }

        tElement.addClass('ms-scroll');

        return function postLink(scope, iElement, iAttrs) {
          var options = {};

          if (iAttrs.msScroll) {
            options = scope.$eval(iAttrs.msScroll);
          }

          options = angular.extend({}, msScrollConfig.getConfig(), options);

          $timeout(function () {
            PerfectScrollbar.initialize(iElement[0], options);
          }, 0);

          iElement.on('mouseenter', updateScrollbar);

          scope.$watch(function () {
            return iElement.prop('scrollHeight');
          }, function (current, old) {
            if (angular.isUndefined(current) || angular.equals(current, old)) {
              return;
            }
            updateScrollbar();
          });

          scope.$watch(function () {
            return iElement.prop('scrollWidth');
          }, function (current, old) {
            if (angular.isUndefined(current) || angular.equals(current, old)) {
              return;
            }
            updateScrollbar();
          });

          function updateScrollbar() {
            PerfectScrollbar.update(iElement[0]);
          }

          scope.$on('$destroy', function () {
            iElement.off('mouseenter');
            PerfectScrollbar.destroy(iElement[0]);
          });
        };
      }
    };
  }
})();
