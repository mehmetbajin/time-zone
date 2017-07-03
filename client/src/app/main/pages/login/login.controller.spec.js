'use strict';

describe('controller: LoginController', function () {
  var vm;

  var $controller;
  var $state;
  var $templateCache;
  var $timeout;
  var $q;
  var Auth;
  var Util;
  var User;

  var error;

  beforeEach(module('app'));

  beforeEach(inject(function (_$controller_, _$state_, _$templateCache_, _$timeout_, _$q_, _Auth_, _Util_, _User_) {
    $controller = _$controller_;
    $state = _$state_;
    $state.go('app.main_pages_login');
    $templateCache = _$templateCache_;
    $timeout = _$timeout_;
    $q = _$q_;
    Auth = _Auth_;
    Util = _Util_;
    User = _User_;
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
    error = {
      error: 'This is an error.'
    };

    spyOn($state, 'go').and.callThrough();
    spyOn(Auth, 'login').and.returnValue($q.resolve());
    spyOn(Util, 'toast');
    spyOn(User, 'getCurrent').and.returnValue($q.resolve());
  });

  describe('login', function () {
    var user;

    beforeEach(function () {
      vm = $controller('LoginController');
      user = {
        email: 'test@test.test',
        password: 'testtest'
      };
    });

    it('flips working bit to true', function () {
      vm.login(user);
      expect(vm.working).toBe(true);
    });

    it('stops working and shows error message on failure', function () {
      Auth.login.and.returnValue($q.reject(error));
      vm.login(user);
      $timeout.flush();
      expect(Auth.login).toHaveBeenCalledWith(user.email, user.password);
      expect(Util.toast).toHaveBeenCalledWith(error);
      expect(vm.working).toBe(false);
    });

    it('state transitions to profile upon login', function () {
      Auth.login.and.returnValue($q.resolve());
      vm.login(user);
      $timeout.flush();
      expect(Auth.login).toHaveBeenCalledWith(user.email, user.password);
      expect($state.go).toHaveBeenCalledWith('app.main_account_profile');
      expect(vm.working).toBe(true);
    });
  });
});
