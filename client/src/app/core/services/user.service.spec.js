'use strict';

describe('service: User', function () {
  var User;
  var Session;
  var $templateCache;
  var $httpBackend;
  var $timeout;
  var apiUrl;

  var user;
  var users;

  beforeEach(module('app'));

  beforeEach(inject(function (_User_, _Session_, _$templateCache_, _$httpBackend_, _$timeout_, _apiUrl_) {
    User = _User_;
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

    users = [_.clone(user), _.clone(user)];

    spyOn(Session, 'get').and.returnValue(user);
    spyOn(Session, 'getToken').and.returnValue(user._token);
  });

  describe('create', function () {
    var password;

    beforeEach(function () {
      password = '12341234';
      $httpBackend.whenPOST(apiUrl + '/users').respond(user);
    });

    it('issues a post request', function (done) {
      $httpBackend.expectPOST(apiUrl + '/users', {
        token: user._token,
        data: _.pick(user, ['name', 'email', 'role']),
        password: password
      });
      User.create(user, password)
        .then(function (_user_) {
          expect(_user_).toEqual(user);
          done();
        });
      $httpBackend.flush();
    });

    it('defaults role to user', function (done) {
      delete user.role;
      $httpBackend.expectPOST(apiUrl + '/users', {
        token: user._token,
        data: _.chain(user).clone().pick(['name', 'email', 'role']).assign({
          role: 10
        }).value(),
        password: password
      });
      User.create(user, password)
        .then(function (_user_) {
          expect(_user_).toEqual(user);
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('get', function () {
    beforeEach(function () {
      $httpBackend.whenGET(apiUrl + '/users/' + user._id + '?token=' + user._token).respond(user);
    });

    it('issues a get request', function (done) {
      $httpBackend.expectGET(apiUrl + '/users/' + user._id + '?token=' + user._token);
      User.get(user._id)
        .then(function (_user_) {
          expect(_user_).toEqual(user);
          done();
        });
      $httpBackend.flush();
    });

    it('rejects if an id is not provided', function (done) {
      User.get()
        .catch(function () {
          $httpBackend.verifyNoOutstandingRequest();
          done();
        });
      $timeout.flush();
    });
  });

  describe('getCurrent', function () {
    beforeEach(function () {
      $httpBackend.whenGET(apiUrl + '/users/' + user._id + '?token=' + user._token).respond(user);
    });

    it('rejects if no id is provided', function (done) {
      user._id = undefined;
      User.getCurrent()
        .catch(function () {
          $httpBackend.verifyNoOutstandingRequest();
          done();
        });
      $timeout.flush();
    });

    it('issues a get request for user if an id is provided', function (done) {
      $httpBackend.expectGET(apiUrl + '/users/' + user._id + '?token=' + user._token);
      User.getCurrent()
        .then(function (_user_) {
          expect(_user_).toEqual(user);
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('getEvery', function () {
    beforeEach(function () {
      $httpBackend.whenGET(apiUrl + '/users?token=' + user._token).respond(users);
    });

    it('issues a get request for all users', function (done) {
      $httpBackend.expectGET(apiUrl + '/users?token=' + user._token);
      User.getEvery()
        .then(function (_users_) {
          expect(_users_).toEqual(users);
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('update', function () {
    beforeEach(function () {
      $httpBackend.whenPUT(apiUrl + '/users/' + user._id).respond(user);
    });

    it('issues a put request', function (done) {
      $httpBackend.expectPUT(apiUrl + '/users/' + user._id, {
        token: user._token,
        data: _.pick(user, ['name', 'email', 'role'])
      });
      User.update(user)
        .then(function (_user_) {
          expect(_user_).toEqual(user);
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('remove', function () {
    beforeEach(function () {
      $httpBackend.whenDELETE(apiUrl + '/users/' + user._id + '?token=' + user._token).respond(null);
    });

    it('issues a delete request', function (done) {
      $httpBackend.expectDELETE(apiUrl + '/users/' + user._id + '?token=' + user._token);
      User.remove(user)
        .then(function (result) {
          expect(result).toBeNull();
          done();
        });
      $httpBackend.flush();
    });
  });
});
