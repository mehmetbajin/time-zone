'use strict';

describe('controller: PasswordResetController', function () {
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
    $state.go('app.main_pages_password-reset');
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
    spyOn(Auth, 'passwordReset').and.returnValue($q.resolve());
    spyOn(Util, 'toast');
    spyOn(User, 'getCurrent').and.returnValue($q.resolve());
  });

  describe('passwordReset', function () {
    var user;

    beforeEach(function () {
      vm = $controller('PasswordResetController');
      user = {
        email: 'test@test.test'
      };
    });

    it('flips working bit to true', function () {
      vm.passwordReset(user);
      expect(vm.working).toBe(true);
    });

    it('stops working and shows error message on failure', function () {
      Auth.passwordReset.and.returnValue($q.reject(error));
      vm.passwordReset(user);
      $timeout.flush();
      expect(Auth.passwordReset).toHaveBeenCalledWith(user.email);
      expect(Util.toast).toHaveBeenCalledWith(error);
      expect(vm.working).toBe(false);
    });

    it('stops working and shows toast on password reset', function () {
      Auth.passwordReset.and.returnValue($q.resolve());
      vm.passwordReset(user);
      $timeout.flush();
      expect(Auth.passwordReset).toHaveBeenCalledWith(user.email);
      expect(Util.toast).toHaveBeenCalledWith('Email containing the password reset link has been sent.');
      expect(vm.working).toBe(false);
    });
  });
});
