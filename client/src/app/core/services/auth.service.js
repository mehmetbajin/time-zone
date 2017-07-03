(function () {
  'use strict';

  angular
    .module('app.core')
    .factory('Auth', Auth);

  /** @ngInject */
  function Auth($q, $http, Util, Session, apiUrl) {
    var service = {
      login: login,
      logout: logout,
      passwordReset: passwordReset,
      passwordSet: passwordSet
    };

    return service;

    //////////

    /**
     * Logs in.
     * @param {string} email
     * @param {string} password
     * @return {!Promise(!User)}
     */
    function login(email, password) {
      var request = {
        email: email,
        password: password
      };

      var onSuccess = function (user) {
        Session.update(user);
      };

      return Util.asQ($http.post(apiUrl + '/auth/login', request), onSuccess);
    }

    /**
     * Logs out.
     * @return {!Promise}
     */
    function logout() {
      var token = Session.getToken();
      if (token) {
        return Util.asQ($http.post(apiUrl + '/auth/logout', {
          token: token
        }), Session.clear);
      } else {
        return $q.reject('Logging out when not logged in is not possible.');
      }
    }

    /**
     * Sends a password reset email.
     * @param {string} email
     * @return {!Promise}
     */
    function passwordReset(email) {
      return Util.asQ($http.post(apiUrl + '/auth/password-reset', {
        email: email
      }));
    }

    /**
     * Sets a user's password.
     * @param {string} oobCode
     * @param {string} password
     * @return {!Promise}
     */
    function passwordSet(oobCode, password) {
      var request = {
        oobCode: oobCode,
        password: password
      };

      return Util.asQ($http.post(apiUrl + '/auth/password-set', request));
    }
  }
})();
