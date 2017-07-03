'use strict';

describe('controller: ToolbarController', function () {
  var vm;

  var $controller;
  var $state;
  var $rootScope;
  var $timeout;
  var $q;
  var $templateCache;
  var $mdSidenavToggle;
  var $mdSidenav;
  var msNavigationService;
  var Auth;
  var Session;
  var Util;
  var eventCode;

  var user;
  var error;

  beforeEach(module('app'));

  beforeEach(inject(function (_$controller_, _$state_, _$rootScope_, _$timeout_, _$q_,
    _$templateCache_, _msNavigationService_, _Auth_, _Session_, _Util_, _eventCode_) {
    $controller = _$controller_;
    $state = _$state_;
    $rootScope = _$rootScope_;
    $timeout = _$timeout_;
    $q = _$q_;
    $templateCache = _$templateCache_;
    $mdSidenavToggle = jasmine.createSpy();
    $mdSidenav = jasmine.createSpy().and.returnValue({
      toggle: $mdSidenavToggle
    });
    msNavigationService = _msNavigationService_;
    Auth = _Auth_;
    Session = _Session_;
    Util = _Util_;
    eventCode = _eventCode_;
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
    user = {
      _id: 'id',
      _token: 'token',
      name: 'name',
      email: 'email',
      role: 10
    };

    error = {
      error: 'This is an error.'
    };

    spyOn(Session, 'get').and.returnValue(user);

    vm = $controller('ToolbarController', {
      $scope: $rootScope.$new(),
      user: null,
      $mdSidenav: $mdSidenav
    });

    $timeout.flush();
  });

  it('loads current user', function () {
    expect(vm.user).toEqual(user);
  });

  it('listens for logged-in event', function () {
    var newUser = _.chain(user).clone().mapValues(function (value) {
      return 'new' + value;
    }).value();
    $rootScope.$broadcast(eventCode.LOGGED_IN, newUser);
    expect(vm.user).toEqual(newUser);
  });

  it('listens for logged-out event', function () {
    $rootScope.$broadcast(eventCode.LOGGED_OUT);
    expect(vm.user).toBeNull();
  });

  describe('logout', function () {
    beforeEach(function () {
      vm.user = user;
      spyOn($state, 'go').and.callThrough();
      spyOn(Util, 'toast');
    });

    it('state transitions to login on logout', function () {
      spyOn(Auth, 'logout').and.returnValue($q.resolve());
      vm.logout();
      $timeout.flush();
      expect(vm.user).toBeNull();
      expect($state.go).toHaveBeenCalledWith('app.main_pages_login');
      expect(Util.toast).not.toHaveBeenCalled();
    });

    it('shows toast on error', function () {
      spyOn(Auth, 'logout').and.returnValue($q.reject(error));
      vm.logout();
      $timeout.flush();
      expect(vm.user).toEqual(user);
      expect($state.go).not.toHaveBeenCalled();
      expect(Util.toast).toHaveBeenCalledWith(error);
    });
  });

  describe('toggleSidenav', function () {
    it('toggles a sidenav', function () {
      vm.toggleSidenav('some-id');
      expect($mdSidenav).toHaveBeenCalledWith('some-id');
      expect($mdSidenavToggle).toHaveBeenCalled();
    });
  });

  describe('toggleMsNavigationFolded', function () {
    it('toggles navigation sidebar folded', function () {
      spyOn(msNavigationService, 'toggleFolded');
      vm.toggleMsNavigationFolded();
      expect(msNavigationService.toggleFolded).toHaveBeenCalled();
    });
  });
});
