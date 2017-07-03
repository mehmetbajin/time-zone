'use strict';

describe('service: Timezone', function () {
  var Timezone;
  var Session;
  var $templateCache;
  var $httpBackend;
  var $timeout;
  var apiUrl;

  var user;
  var timezone;
  var timezones;

  beforeEach(module('app'));

  beforeEach(inject(function (_Timezone_, _Session_, _$templateCache_, _$httpBackend_, _$timeout_, _apiUrl_) {
    Timezone = _Timezone_;
    Session = _Session_;
    $templateCache = _$templateCache_;
    $httpBackend = _$httpBackend_;
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

    timezone = {
      _id: 'id',
      code: 'code',
      city: 'city',
      owner: 'owner'
    };

    timezones = [_.clone(timezone), _.clone(timezone)];

    spyOn(Session, 'get').and.returnValue(user);
    spyOn(Session, 'getToken').and.returnValue(user._token);
  });

  describe('create', function () {
    beforeEach(function () {
      $httpBackend.whenPOST(apiUrl + '/timezones').respond(timezone);
    });

    it('issues a post request', function (done) {
      $httpBackend.expectPOST(apiUrl + '/timezones', {
        token: user._token,
        data: _.pick(timezone, ['code', 'city', 'owner'])
      });
      Timezone.create(timezone)
        .then(function (_timezone_) {
          expect(_timezone_).toEqual(timezone);
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('get', function () {
    beforeEach(function () {
      $httpBackend.whenGET(apiUrl + '/timezones/' + timezone._id + '?token=' + user._token).respond(timezone);
    });

    it('issues a get request', function (done) {
      $httpBackend.expectGET(apiUrl + '/timezones/' + timezone._id + '?token=' + user._token);
      Timezone.get(timezone._id)
        .then(function (_timezone_) {
          expect(_timezone_).toEqual(timezone);
          done();
        });
      $httpBackend.flush();
    });

    it('rejects if an id is not provided', function (done) {
      Timezone.get()
        .catch(function () {
          $httpBackend.verifyNoOutstandingRequest();
          done();
        });
      $timeout.flush();
    });
  });

  describe('getEvery', function () {
    beforeEach(function () {
      $httpBackend.whenGET(apiUrl + '/timezones?token=' + user._token).respond(timezones);
    });

    it('issues a get request for all timezones', function (done) {
      $httpBackend.expectGET(apiUrl + '/timezones?token=' + user._token);
      Timezone.getEvery()
        .then(function (_timezones_) {
          expect(_timezones_).toEqual(timezones);
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('update', function () {
    beforeEach(function () {
      $httpBackend.whenPUT(apiUrl + '/timezones/' + timezone._id).respond(timezone);
    });

    it('issues a put request', function (done) {
      $httpBackend.expectPUT(apiUrl + '/timezones/' + timezone._id, {
        token: user._token,
        data: _.pick(timezone, ['code', 'city', 'owner'])
      });
      Timezone.update(timezone)
        .then(function (_timezone_) {
          expect(_timezone_).toEqual(timezone);
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('remove', function () {
    beforeEach(function () {
      $httpBackend.whenDELETE(apiUrl + '/timezones/' + timezone._id + '?token=' + user._token).respond(null);
    });

    it('issues a delete request', function (done) {
      $httpBackend.expectDELETE(apiUrl + '/timezones/' + timezone._id + '?token=' + user._token);
      Timezone.remove(timezone)
        .then(function (result) {
          expect(result).toBeNull();
          done();
        });
      $httpBackend.flush();
    });
  });
});
