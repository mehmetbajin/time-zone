(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('Timezone', Timezone);

  /** @ngInject */
  function Timezone($q, $http, Util, Session, apiUrl) {
    var service = {
      create: create,
      get: get,
      getEvery: getEvery,
      update: update,
      remove: remove
    };

    return service;

    //////////

    /**
     * Creates a new timezone record.
     * @param {!Timezone} timezone
     * @return {!Promise}
     */
    function create(timezone) {
      var request = {
        token: Session.getToken(),
        data: _.pick(timezone, ['code', 'city', 'owner'])
      };

      return Util.asQ($http.post(apiUrl + '/timezones', request));
    }

    /**
     * Loads a timezone record.
     * @param {string} id
     * @return {!Promise}
     */
    function get(id) {
      return id ? Util.asQ($http.get(apiUrl + '/timezones/' + id + '?token=' + Session.getToken())) : $q.reject();
    }

    /**
     * Loads every timezone record.
     * @return {!Promise}
     */
    function getEvery() {
      return Util.asQ($http.get(apiUrl + '/timezones?token=' + Session.getToken()));
    }

    /**
     * Updates a timezone record.
     * @param {!Timezone} timezone
     * @return {!Promise}
     */
    function update(timezone) {
      var request = {
        token: Session.getToken(),
        data: _.pick(timezone, ['code', 'city', 'owner'])
      };

      return Util.asQ($http.put(apiUrl + '/timezones/' + timezone._id, request));
    }

    /**
     * Deletes a timezone record.
     * @param {!Timezone} timezone
     * @return {!Promise}
     */
    function remove(timezone) {
      return Util.asQ($http.delete(apiUrl + '/timezones/' + timezone._id + '?token=' + Session.getToken()));
    }
  }
})();
