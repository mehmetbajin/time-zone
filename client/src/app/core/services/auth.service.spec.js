'use strict';

describe('service: Auth', function () {
  var Auth;
  var Session;
  var $httpBackend;
  var $templateCache;
  var $timeout;
  var apiUrl;

  var user;
  var email;
  var password;
  var oobCode;

  beforeEach(module('app'));

  beforeEach(inject(function (_Auth_, _Session_, _$httpBackend_, _$templateCache_, _$timeout_, _apiUrl_) {
    Auth = _Auth_;
    Session = _Session_;
    $httpBackend = _$httpBackend_;
    $templateCache = _$templateCache_;
    $timeout = _$timeout_;
    apiUrl = _apiUrl_;
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

    email = 'test@test.test';
    password = '12341234';
    oobCode = 'oooobbbbcccoooddeee';
  });

  describe('login', function () {
    beforeEach(function () {
      $httpBackend.whenPOST(apiUrl + '/auth/login').respond(user);
      spyOn(Session, 'update');
    });

    it('issues a post request', function () {
      $httpBackend.expectPOST(apiUrl + '/auth/login', {
        email: email,
        password: password
      });
      Auth.login(email, password);
      $httpBackend.flush();
    });

    it('updates session with user data', function (done) {
      Auth.login(email, password)
        .then(function (_user_) {
          expect(_user_).toEqual(user);
          expect(Session.update).toHaveBeenCalledWith(user);
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('logout', function () {
    beforeEach(function () {
      $httpBackend.whenPOST(apiUrl + '/auth/logout').respond(null);
      spyOn(Session, 'clear');
    });

    it('fails if there is no current user', function (done) {
      spyOn(Session, 'getToken').and.returnValue(null);
      Auth.logout()
        .catch(function (error) {
          expect(error).toBeDefined();
          done();
        });
      $timeout.flush();
    });

    it('issues a post request if there is a current user', function () {
      spyOn(Session, 'getToken').and.returnValue(user._token);
      $httpBackend.expectPOST(apiUrl + '/auth/logout', {
        token: user._token
      });
      Auth.logout();
      $httpBackend.flush();
    });

    it('clears session upon logout', function (done) {
      spyOn(Session, 'getToken').and.returnValue(user._token);
      Auth.logout()
        .then(function (result) {
          expect(Session.clear).toHaveBeenCalled();
          expect(result).toBeNull();
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('passwordReset', function () {
    beforeEach(function () {
      $httpBackend.whenPOST(apiUrl + '/auth/password-reset').respond(null);
    });

    it('issues a post request', function (done) {
      $httpBackend.expectPOST(apiUrl + '/auth/password-reset', {
        email: email
      });
      Auth.passwordReset(email)
        .then(function (result) {
          expect(result).toBeNull();
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('passwordSet', function () {
    beforeEach(function () {
      $httpBackend.whenPOST(apiUrl + '/auth/password-set').respond(email);
    });

    it('issues a post request', function (done) {
      $httpBackend.expectPOST(apiUrl + '/auth/password-set', {
        oobCode: oobCode,
        password: password
      });
      Auth.passwordSet(oobCode, password)
        .then(function (result) {
          expect(result).toEqual(email);
          done();
        });
      $httpBackend.flush();
    });
  });
});
