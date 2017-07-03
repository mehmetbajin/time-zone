(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('City', City);

  /** @ngInject */
  function City($q, $http, Util, apiUrl) {
    var service = {
      _cache: null,
      get: get
    };

    return service;

    //////////

    /**
     * Loads all cities.
     * @return {!Promise}
     */
    function get() {
      if (service._cache) {
        return $q.resolve(service._cache);
      } else {
        return Util.asQ($http.get(apiUrl + '/cities'), function (cities) {
          service._cache = _.clone(cities);
        });
      }
    }
  }
})();
