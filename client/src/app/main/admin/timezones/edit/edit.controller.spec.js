'use strict';

describe('controller: TimezoneEditController', function () {
  var vm;

  var $controller;
  var $mdDialog;
  var Session;

  var timezone;
  var user;
  var users;
  var cities;
  var codes;

  beforeEach(module('app'));

  beforeEach(inject(function (_$controller_, _$mdDialog_, _Session_) {
    $controller = _$controller_;
    $mdDialog = _$mdDialog_;
    Session = _Session_;
  }));

  beforeEach(function () {
    timezone = {
      _id: '-KW7-moeO1xqJAlcVNRh',
      city: '-KVcs654MQP2BLdjFWjE',
      code: '-KVcqgMV67Fsw87PZR49',
      owner: 'qNbDL4j8Kvc6jhVAnxBLSb8TLB52'
    };

    user = {
      _id: 'id',
      _token: 'token',
      name: 'name',
      email: 'email',
      role: 10
    };

    cities = [{
      code: 'a',
      name: 'name1',
      _id: 'id1'
    }, {
      code: 'b',
      name: 'name2',
      _id: 'id2'
    }, {
      code: 'a',
      name: 'name3',
      _id: 'id3'
    }];

    spyOn($mdDialog, 'hide');
    spyOn($mdDialog, 'cancel');
    spyOn(Session, 'get').and.returnValue(user);

    vm = $controller('TimezoneEditController', {
      timezone: timezone,
      codes: codes,
      cities: cities,
      users: users
    });
  });

  describe('init', function () {
    it('detects an edit', function () {
      expect(vm.editing).toBe(true);
      expect(vm.timezone).toEqual(timezone);
    });

    it('detects an add and does not default an owner for admins', function () {
      spyOn(Session, 'isAdmin').and.returnValue(true);
      vm = $controller('TimezoneEditController', {
        timezone: null,
        codes: codes,
        cities: cities,
        users: users
      });
      expect(vm.editing).toBe(false);
      expect(vm.timezone).toEqual({
        code: null,
        city: null,
        owner: null
      });
    });

    it('detects an add defaults owner to current user for non-admins', function () {
      spyOn(Session, 'isAdmin').and.returnValue(false);
      vm = $controller('TimezoneEditController', {
        timezone: null,
        codes: codes,
        cities: cities,
        users: users
      });
      expect(vm.editing).toBe(false);
      expect(vm.timezone).toEqual({
        code: null,
        city: null,
        owner: user._id
      });
    });
  });

  describe('admin', function () {
    it('reports whether current user is an admin', function () {
      spyOn(Session, 'isAdmin').and.returnValue(true);
      expect(vm.admin()).toBe(true);
      expect(Session.isAdmin).toHaveBeenCalled();

      Session.isAdmin.and.returnValue(false);
      expect(vm.admin()).toBe(false);
      expect(Session.isAdmin).toHaveBeenCalled();
    });
  });

  describe('codeChanged', function () {
    beforeEach(function () {
      vm.f = jasmine.createSpyObj('vm.f', ['$setPristine', '$setValidity']);
    });

    it('clears the city', function () {
      vm.timezone.city = 'something';
      vm.codeChanged();
      expect(vm.timezone.city).toBeNull();
    });

    it('resets the form', function () {
      vm.codeChanged();
      expect(vm.f.$setPristine).toHaveBeenCalled();
      expect(vm.f.$setValidity).toHaveBeenCalled();
    });
  });

  describe('citiesOf', function () {
    it('finds cities of a given code', function () {
      expect(vm.citiesOf('a')).toEqual([cities[0], cities[2]]);
      expect(vm.citiesByCode['a']).toEqual([cities[0], cities[2]]);
      expect(vm.citiesOf('a')).toEqual([cities[0], cities[2]]);
    });
  });

  it('cancels', function () {
    vm.cancel();
    expect($mdDialog.cancel).toHaveBeenCalled();
  });

  it('removes', function () {
    vm.remove();
    expect($mdDialog.hide).toHaveBeenCalledWith(null);
  });

  it('hides', function () {
    vm.ok();
    expect($mdDialog.hide).toHaveBeenCalledWith(timezone);
  });
});
