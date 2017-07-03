(function () {
  'use strict';

  angular
    .module('app.core')
    .filter('tzRole', tzRoleFilter)
    .filter('tzCodeName', tzCodeNameFilter);

  /** @ngInject */
  function tzRoleFilter(userRole) {
    var roleNames = _.fromPairs([
      [userRole.User, 'User'],
      [userRole.Manager, 'Manager'],
      [userRole.Admin, 'Administrator']
    ]);

    return function (role) {
      return _.get(roleNames, role, 'Unknown');
    };
  }

  /** @ngInject */
  function tzCodeNameFilter() {
    return function (code) {
      return code ? (code.name + ' (GMT' + code.offset + ')') : ('');
    }
  }
})();
