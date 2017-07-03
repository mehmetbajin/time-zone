(function () {
  'use strict';

  angular
    .module('app')
    .constant('apiUrl', 'http://localhost:5000/api/v1')
    .constant('eventCode', {
      LOGGED_IN: 'LOGGED_IN',
      LOGGED_OUT: 'LOGGED_OUT'
    })
    .constant('userRole', {
      User: 10,
      Manager: 20,
      Admin: 99
    });
})();
