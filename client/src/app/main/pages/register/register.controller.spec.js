'use strict';

describe('controller: RegisterController', function () {
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
    $state.go('app.main_pages_register');
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
    spyOn(User, 'create').and.returnValue($q.resolve());
    spyOn(User, 'getCurrent').and.returnValue($q.resolve());
  });

  describe('register', function () {
    var user;

    beforeEach(function () {
      vm = $controller('RegisterController');
      user = {
        name: 'test',
        email: 'test@test.test',
        password: 'testtest'
      };
    });

    it('flips working bit to true', function () {
      vm.register(user);
      expect(vm.working).toBe(true);
    });

    it('stops working and shows error message on failure', function () {
      User.create.and.returnValue($q.reject(error));
      vm.register(user);
      $timeout.flush();
      expect(User.create).toHaveBeenCalledWith(jasmine.objectContaining({
        name: user.name,
        email: user.email
      }), user.password);
      expect(Util.toast).toHaveBeenCalledWith(error);
      expect(vm.working).toBe(false);
    });

    it('logs in and state transitions to profile on password set', function () {
      User.create.and.returnValue($q.resolve());
      vm.register(user);
      $timeout.flush();
      expect(User.create).toHaveBeenCalledWith(jasmine.objectContaining({
        name: user.name,
        email: user.email
      }), user.password);
      expect(Auth.login).toHaveBeenCalledWith(user.email, user.password);
      expect($state.go).toHaveBeenCalledWith('app.main_account_profile');
      expect(vm.working).toBe(true);
    });
  });
});
