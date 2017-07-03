(function () {
  'use strict';

  angular
    .module('app.main.admin.timezones')
    .controller('TimezoneEditController', TimezoneEditController);

  /** @ngInject */
  function TimezoneEditController($mdDialog, Session, timezone, codes, cities, users) {
    var vm = this;

    // Data

    vm.editing = !!timezone;
    vm.timezone = vm.editing ? _.clone(timezone) : {
      code: null,
      city: null,
      owner: !admin() ? _.get(Session.get(), '_id', null) : null
    };

    vm.codes = codes;
    vm.cities = cities;
    vm.users = users;

    vm.citiesByCode = {};

    // Methods

    vm.admin = admin;
    vm.codeChanged = codeChanged;
    vm.citiesOf = citiesOf;

    vm.cancel = cancel;
    vm.remove = remove;
    vm.ok = ok;

    //////////

    function admin() {
      return Session.isAdmin();
    }

    function codeChanged() {
      vm.timezone.city = null;
      vm.f.$setPristine();
      vm.f.$setValidity();
    }

    function citiesOf(code) {
      if (!vm.citiesByCode[code]) {
        vm.citiesByCode[code] = _.filter(vm.cities, ['code', code]);
      }
      return vm.citiesByCode[code];
    }

    function cancel() {
      $mdDialog.cancel();
    }

    function remove() {
      $mdDialog.hide(null);
    }

    function ok() {
      $mdDialog.hide(vm.timezone);
    }
  }
})();
