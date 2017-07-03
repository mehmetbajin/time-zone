(function () {
  'use strict';

  angular
    .module('app.core')
    .provider('fuseConfig', fuseConfigProvider);

  /* istanbul ignore next */
  /** @ngInject */
  function fuseConfigProvider() {
    var fuseConfiguration = {
      'disableCustomScrollbars': false,
      'disableMdInkRippleOnMobile': true,
      'disableCustomScrollbarsOnMobile': true
    };

    // Methods

    this.config = config;

    //////////

    function config(configuration) {
      fuseConfiguration = angular.extend({}, fuseConfiguration, configuration);
    }

    this.$get = function () {
      var service = {
        getConfig: getConfig,
        setConfig: setConfig
      };

      return service;

      //////////

      function getConfig(configName) {
        if (angular.isUndefined(fuseConfiguration[configName])) {
          return false;
        }

        return fuseConfiguration[configName];
      }

      function setConfig(configName, configValue) {
        fuseConfiguration[configName] = configValue;
      }
    };
  }

})();
