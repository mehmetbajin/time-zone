(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('Code', Code);

  /** @ngInject */
  function Code($q, $http, Util, apiUrl) {
    var service = {
      _cache: null,
      get: get
    };

    return service;

    //////////

    /**
     * Loads all codes.
     * @return {!Promise}
     */
    function get() {
      if (service._cache) {
        return $q.resolve(service._cache);
      } else {
        return Util.asQ($http.get(apiUrl + '/codes'), function (codes) {
          service._cache = _.clone(codes);
        });
      }
    }
  }
})();
