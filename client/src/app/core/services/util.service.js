(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('Util', Util);

  /** @ngInject */
  function Util($q, $mdToast) {
    var service = {
      toast: toast,
      asQ: asQ
    };

    return service;

    //////////

    /**
     * Shows a toast.
     * @param {?Object|?string} data
     */
    function toast(data) {
      var message = _.isString(data) ? (data || null) : _.get(data, 'error', null);
      if (message) {
        $mdToast.hide()
          .then(function () {
            $mdToast.showSimple(message);
          });
      }
    }

    /**
     * Wraps an HTTP promise into a Q promise.
     * @param {!HttpPromise} httpPromise
     * @param {!Function=} onSuccess
     * @param {!Function=} onFailure
     * @return {!Promise}
     */
    function asQ(httpPromise, onSuccess, onFailure) {
      var deferred = $q.defer();

      httpPromise
        .then(function (response) {
          if (onSuccess) {
            onSuccess(response.data);
          }
          deferred.resolve(response.data);
        })
        .catch(function (response) {
          if (onFailure) {
            onFailure(response.data);
          }
          deferred.reject(response.data);
        });

      return deferred.promise;
    }
  }
})();
