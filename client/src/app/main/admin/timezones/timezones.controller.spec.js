'use strict';

describe('controller: TimezonesController', function () {
  var vm;

  var $controller;
  var $templateCache;
  var $mdDialog;
  var $q;
  var $timeout;
  var $rootScope;
  var Timezone;
  var Util;
  var Session;

  var timezones;
  var cities;
  var codes;
  var users;

  beforeEach(module('app'));

  beforeEach(inject(function (_$controller_, _$templateCache_, _$mdDialog_, _$q_, _$timeout_,
    _$rootScope_, _Timezone_, _Util_, _Session_) {
    $controller = _$controller_;
    $templateCache = _$templateCache_;
    $mdDialog = _$mdDialog_;
    $q = _$q_;
    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    Timezone = _Timezone_;
    Util = _Util_;
    Session = _Session_;
  }));

  beforeEach(function () {
    $templateCache.put('app/core/layouts/vertical-navigation.html', '');
    $templateCache.put('app/toolbar/layouts/vertical-navigation/toolbar.html', '');
    $templateCache.put('app/navigation/layouts/vertical-navigation/navigation.html', '');
    $templateCache.put('app/core/layouts/content-only.html', '');
    $templateCache.put('app/main/pages/login/login.html', '');
    $templateCache.put('app/main/pages/register/register.html', '');
    $templateCache.put('app/main/pages/password-reset/password-reset.html', '');
    $templateCache.put('app/main/pages/password-set/password-set.html', '');
    $templateCache.put('app/main/account/profile/profile.html', '');
    $templateCache.put('app/main/admin/timezones/timezones.html', '');
    $templateCache.put('app/main/admin/users/users.html', '');
  });

  beforeEach(function () {
    timezones = [{
      _id: 'tz1',
      code: 't2',
      city: 'c2',
      owner: 'id1'
    }, {
      _id: 'tz2',
      code: 't1',
      city: 'c1',
      owner: 'id3'
    }, {
      _id: 'tz3',
      code: 't2',
      city: 'c2',
      owner: 'id2'
    }];

    cities = [{
      code: 't1',
      name: 'city1',
      _id: 'c1'
    }, {
      code: 't2',
      name: 'city2',
      _id: 'c2'
    }];

    codes = [{
      name: 'GMT Standard Time',
      offset: '+00:00',
      _id: 't1'
    }, {
      name: 'Alaskan Standard Time',
      offset: '-09:00',
      _id: 't2'
    }];

    users = [{
      _id: 'id1',
      name: 'name1',
      email: 'email1',
      role: 10
    }, {
      _id: 'id2',
      name: 'name2',
      email: 'email2',
      role: 20
    }, {
      _id: 'id3',
      name: 'name3',
      email: 'email3',
      role: 99
    }];

    spyOn(Session, 'get').and.returnValue(_.clone(users[1]));
    spyOn($mdDialog, 'hide');
    spyOn($mdDialog, 'cancel');

    vm = $controller('TimezonesController', {
      timezones: timezones,
      cities: cities,
      codes: codes,
      users: users,
      $scope: $rootScope.$new()
    });
  });

  describe('filter', function () {
    it('filters on name', function () {
      vm.filters.name = 'stand';
      expect(vm.filter(timezones[0])).toBe(true);
      expect(vm.filter(timezones[1])).toBe(true);
      expect(vm.filter(timezones[2])).toBe(true);

      vm.filters.name = 'alask';
      expect(vm.filter(timezones[0])).toBe(true);
      expect(vm.filter(timezones[1])).toBe(false);
      expect(vm.filter(timezones[2])).toBe(true);
    });
  });

  describe('filtered', function () {
    it('filters on name', function () {
      vm.filters.name = 'stand';
      expect(vm.filtered()).toEqual([timezones[0], timezones[1], timezones[2]]);

      vm.filters.name = null;
      expect(vm.filtered()).toEqual([timezones[0], timezones[1], timezones[2]]);

      vm.filters.name = 'alask';
      expect(vm.filtered()).toEqual([timezones[0], timezones[2]]);
    });
  });

  describe('formatName', function () {
    it('returns the timezone code name', function () {
      expect(vm.formatName(timezones[0])).toEqual('Alaskan Standard Time (GMT-09:00)');
      expect(vm.formatName(timezones[1])).toEqual('GMT Standard Time (GMT+00:00)');
      expect(vm.formatName(timezones[2])).toEqual('Alaskan Standard Time (GMT-09:00)');
    });
  });

  describe('formatCity', function () {
    it('returns the city name', function () {
      expect(vm.formatCity(timezones[0])).toEqual('city2');
      expect(vm.formatCity(timezones[1])).toEqual('city1');
      expect(vm.formatCity(timezones[2])).toEqual('city2');
    });
  });

  describe('formatOwner', function () {
    it('returns the owner name', function () {
      expect(vm.formatOwner(timezones[0])).toEqual('name1');
      expect(vm.formatOwner(timezones[1])).toEqual('name3');
      expect(vm.formatOwner(timezones[2])).toEqual('name2');
    });
  });

  describe('formatMoment', function () {
    it('returns the current time in timezone', function () {
      expect(vm.formatMoment(timezones[0]).format()).toEqual(moment().utcOffset('-09:00').format());
      expect(vm.formatMoment(timezones[1]).format()).toEqual(moment().utcOffset('+00:00').format());
      expect(vm.formatMoment(timezones[2]).format()).toEqual(moment().utcOffset('-09:00').format());
    });
  });

  describe('offsetNumber', function () {
    it('returns the numeric offset', function () {
      expect(vm.offsetNumber(timezones[0])).toEqual(-9);
      expect(vm.offsetNumber(timezones[1])).toEqual(0)
      expect(vm.offsetNumber(timezones[2])).toEqual(-9);
    });
  });

  describe('edit', function () {
    beforeEach(function () {
      spyOn(Util, 'toast');
      vm.timezones = timezones;
      $rootScope.loadingProgress = false;
    });

    it('does nothing if already working', function () {
      spyOn($mdDialog, 'show');
      $rootScope.loadingProgress = true;
      vm.edit(null, null);
      $timeout.flush();
      expect($mdDialog.show).not.toHaveBeenCalled();
    });

    it('adds a new timezone', function () {
      var timezoneToCreate = {
        code: 't2',
        city: 'c1',
        owner: 'id3'
      };
      var createdTimezone = _.chain(timezoneToCreate).clone().assign({
        _id: 't0'
      }).value();
      spyOn($mdDialog, 'show').and.returnValue($q.resolve(timezoneToCreate));
      spyOn(Timezone, 'create').and.returnValue($q.resolve(createdTimezone));

      vm.edit(null, null);
      $timeout.flush();

      expect($mdDialog.show).toHaveBeenCalled();
      expect($rootScope.loadingProgress).toBe(false);
      expect(Timezone.create).toHaveBeenCalledWith(timezoneToCreate);
      expect(vm.timezones).toContain(createdTimezone);
      expect(Util.toast).toHaveBeenCalledWith('Timezone added.');
    });

    it('updates an existing timezone', function () {
      var timezoneToUpdate = _.clone(vm.timezones[1]);
      var updatedTimezone = _.chain(timezoneToUpdate).clone().assign({
        city: 'c0'
      }).value();
      spyOn($mdDialog, 'show').and.returnValue($q.resolve(updatedTimezone));
      spyOn(Timezone, 'update').and.returnValue($q.resolve(updatedTimezone));

      vm.edit(null, timezoneToUpdate);
      $timeout.flush();

      expect($mdDialog.show).toHaveBeenCalled();
      expect($rootScope.loadingProgress).toBe(false);
      expect(Timezone.update).toHaveBeenCalledWith(updatedTimezone);
      expect(vm.timezones).toContain(updatedTimezone);
      expect(vm.timezones).not.toContain(timezoneToUpdate);
      expect(Util.toast).toHaveBeenCalledWith('Timezone updated.');
    });

    it('removes an existing timezone', function () {
      var timezoneToRemove = _.clone(vm.timezones[2]);
      spyOn($mdDialog, 'show').and.returnValue($q.resolve(null));
      spyOn(Timezone, 'remove').and.returnValue($q.resolve(null));

      vm.edit(null, timezoneToRemove);
      $timeout.flush();

      expect($mdDialog.show).toHaveBeenCalled();
      expect($rootScope.loadingProgress).toBe(false);
      expect(Timezone.remove).toHaveBeenCalledWith(timezoneToRemove);
      expect(vm.timezones).not.toContain(timezoneToRemove);
      expect(Util.toast).toHaveBeenCalledWith('Timezone removed.');
    });
  });
});
