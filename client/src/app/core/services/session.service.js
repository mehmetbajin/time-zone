(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('Session', Session);

  /** @ngInject */
  function Session($q, $http, $cookies, $rootScope, PermRoleStore, eventCode, userRole, apiUrl) {
    var cookieName = 'user';

    var service = {
      _user: $cookies.getObject(cookieName) || null,
      _authStateChanged: authStateChanged,
      check: check,
      get: get,
      getToken: getToken,
      update: update,
      clear: clear,
      defineRoles: defineRoles,
      isAdmin: isAdmin,
      isManager: isManager,
      isUser: isUser
    };

    service._authStateChanged();

    return service;

    //////////

    /**
     * Handles authentication state change.
     * @private
     */
    function authStateChanged() {
      service.defineRoles();
      if (service._user) {
        $rootScope.$broadcast(eventCode.LOGGED_IN, service._user);
      } else {
        $rootScope.$broadcast(eventCode.LOGGED_OUT);
      }
    }

    /**
     * Checks auth token status and logs out if expired.
     * @return {!Promise}
     */
    function check() {
      var deferred = $q.defer();

      function authenticated(response) {
        service.update(response.data);
        deferred.resolve();
      }

      function unauthenticated( /* response */ ) {
        service.clear();
        deferred.reject();
      }

      if (service._user) {
        $http.get(apiUrl + '/users/' + service._user._id + '?token=' + service._user._token)
          .then(authenticated)
          .catch(unauthenticated);
      } else {
        unauthenticated();
      }

      return deferred.promise;
    }

    /**
     * Gets the current user (if there is one).
     * @return {?User}
     */
    function get() {
      return service._user;
    }

    /**
     * Gets the current session token (if there is one).
     * @return {?string}
     */
    function getToken() {
      return _.get(service._user, '_token', null);
    }

    /**
     * Updates the current user.
     * @param {!User}
     */
    function update(user) {
      service._user = service._user || {};
      _.assign(service._user, user);
      $cookies.putObject(cookieName, service._user);
      service._authStateChanged();
    }

    /**
     * Nukes the current user.
     */
    function clear() {
      service._user = null;
      $cookies.remove(cookieName);
      service._authStateChanged();
    }

    /**
     * Defines roles.
     */
    function defineRoles() {
      PermRoleStore.clearStore();
      switch (_.get(service._user, 'role', null)) {
      case userRole.User:
        PermRoleStore.defineRole('USER', []);
        break;
      case userRole.Manager:
        PermRoleStore.defineRole('MANAGER', []);
        break;
      case userRole.Admin:
        PermRoleStore.defineRole('ADMIN', []);
        break;
      default:
        PermRoleStore.defineRole('UNAUTHENTICATED', []);
        break;
      }
    }

    /**
     * Determines if current user is an administrator.
     * @return {boolean}
     */
    function isAdmin() {
      return _.get(service._user, 'role') === userRole.Admin;
    }

    /**
     * Determines if current user is a manager.
     * @return {boolean}
     */
    function isManager() {
      return _.get(service._user, 'role') === userRole.Manager;
    }

    /**
     * Determines if current user is a regular user.
     * @return {boolean}
     */
    function isUser() {
      return _.get(service._user, 'role') === userRole.User;
    }
  }
})();
