(function () {
  'use strict';

  angular
    .module('app.core')
    .config(config);

  /** @ngInject */
  function config($ariaProvider, $logProvider, msScrollConfigProvider, fuseConfigProvider) {
    $logProvider.debugEnabled(true);

    /*eslint-disable */
    $ariaProvider.config({
      tabindex: false
    });

    fuseConfigProvider.config({
      'disableCustomScrollbars': false,
      'disableCustomScrollbarsOnMobile': true,
      'disableMdInkRippleOnMobile': true
    });

    msScrollConfigProvider.config({
      wheelPropagation: true
    });
    /*eslint-enable */
  }
})();
