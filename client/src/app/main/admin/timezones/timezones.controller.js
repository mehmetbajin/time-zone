(function () {
  'use strict';

  angular
    .module('app.main.admin.timezones')
    .controller('TimezonesController', TimezonesController);

  /** @ngInject */
  function TimezonesController($interval, $scope, $filter, $rootScope, $mdDialog, Util, Timezone, timezones, cities, codes, users) {
    var vm = this;
    var tzCodeName = $filter('tzCodeName');

    // Data

    vm.timezones = timezones;
    vm.cities = indexById(cities);
    vm.codes = indexById(codes);
    vm.users = indexById(users);

    vm.filters = {
      name: null
    };

    // Methods

    vm.filter = filter;
    vm.filtered = filtered;

    vm.formatName = formatName;
    vm.formatCity = formatCity;
    vm.formatOwner = formatOwner;
    vm.formatMoment = formatMoment;

    vm.offsetNumber = offsetNumber;

    vm.edit = edit;

    //////////

    init();

    function init() {
      var ticker = $interval(angular.noop, 1000);

      $scope.$on('$destroy', function () {
        $interval.cancel(ticker);
      });
    }

    function indexById(list) {
      return _.zipObject(_.map(list, '_id'), list);
    }

    function filter(timezone) {
      var n = _.toLower(formatName(timezone));
      var q = _.toLower(vm.filters.name || '');
      return _.isEmpty(q) || _.includes(q, n) || _.includes(n, q);
    }

    function filtered() {
      return _.filter(vm.timezones, filter);
    }

    function formatName(timezone) {
      return tzCodeName(_.get(vm.codes, timezone.code));
    }

    function formatCity(timezone) {
      return _.get(vm.cities, [timezone.city, 'name'], '');
    }

    function formatOwner(timezone) {
      return _.get(vm.users, [timezone.owner, 'name'], '');
    }

    function formatMoment(timezone) {
      return moment().utcOffset(_.get(vm.codes, [timezone.code, 'offset']));
    }

    function offsetNumber(timezone) {
      var offset = _.get(vm.codes, [timezone.code, 'offset']);
      return _.toNumber(offset.replace(':', '.'));
    }

    function edit($event, timezone) {
      if ($rootScope.loadingProgress) {
        return;
      }

      var original = _.clone(timezone);

      var dialog = {
        controller: 'TimezoneEditController as vm',
        templateUrl: 'app/main/admin/timezones/edit/edit.html',
        parent: angular.element('body'),
        targetEvent: $event,
        clickOutsideToClose: true,
        locals: {
          timezone: timezone,
          cities: cities,
          codes: codes,
          users: users
        }
      };

      $mdDialog.show(dialog)
        .then(function (timezone) {
          $rootScope.loadingProgress = true;
          if (timezone === null) {
            return Timezone.remove(original);
          } else if (original === null) {
            return Timezone.create(timezone);
          } else {
            return Timezone.update(timezone);
          }
        })
        .then(function (timezone) {
          if (timezone === null) {
            _.pullAt(vm.timezones, _.findIndex(vm.timezones, ['_id', original._id]));
            Util.toast('Timezone removed.');
          } else if (original === null) {
            vm.timezones.push(timezone);
            Util.toast('Timezone added.');
          } else {
            _.assign(vm.timezones[_.findIndex(vm.timezones, ['_id', original._id])], timezone);
            Util.toast('Timezone updated.');
          }
        })
        .catch(Util.toast)
        .finally(function () {
          $rootScope.loadingProgress = false;
        });
    }
  }
})();
