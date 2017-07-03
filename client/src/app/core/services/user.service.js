(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('User', User);

  /** @ngInject */
  function User($q, $http, Util, Session, apiUrl, userRole) {
    var service = {
      create: create,
      get: get,
      getCurrent: getCurrent,
      getEvery: getEvery,
      update: update,
      remove: remove
    };

    return service;

    //////////

    /**
     * Creates a new user.
     * @param {!User} user
     * @param {string} password
     * @return {!Promise}
     */
    function create(user, password) {
      user.role = user.role || userRole.User;

      var request = {
        token: Session.getToken(),
        data: _.pick(user, ['name', 'email', 'role']),
        password: password
      };

      return Util.asQ($http.post(apiUrl + '/users', request));
    }

    /**
     * Loads a user record.
     * @param {string} id
     * @return {!Promise}
     */
    function get(id) {
      return id ? Util.asQ($http.get(apiUrl + '/users/' + id + '?token=' + Session.getToken())) : $q.reject();
    }

    /**
     * Gets the current user.
     * @return {!Promise}
     */
    function getCurrent() {
      return get(_.get(Session.get(), '_id', null));
    }

    /**
     * Loads every user record.
     * @return {!Promise}
     */
    function getEvery() {
      return Util.asQ($http.get(apiUrl + '/users?token=' + Session.getToken()));
    }

    /**
     * Updates a user record.
     * @param {!User} user
     * @return {!Promise}
     */
    function update(user) {
      var request = {
        token: Session.getToken(),
        data: _.pick(user, ['name', 'email', 'role'])
      };

      return Util.asQ($http.put(apiUrl + '/users/' + user._id, request));
    }

    /**
     * Deletes a user record.
     * @param {!User} user
     * @return {!Promise}
     */
    function remove(user) {
      return Util.asQ($http.delete(apiUrl + '/users/' + user._id + '?token=' + Session.getToken()));
    }
  }
})();
