'use strict';

describe('service: Session', function () {
  var Session;
  var $rootScope;
  var $cookies;
  var $httpBackend;
  var $timeout;
  var $templateCache;
  var PermRoleStore;
  var eventCode;
  var userRole;

  var user;

  beforeEach(module('app'));

  beforeEach(inject(function (_Session_, _$rootScope_, _$cookies_, _$httpBackend_,
    _$timeout_, _$templateCache_, _PermRoleStore_, _eventCode_, _userRole_) {
    Session = _Session_;
    $rootScope = _$rootScope_;
    $cookies = _$cookies_;
    $httpBackend = _$httpBackend_;
    $timeout = _$timeout_;
    $templateCache = _$templateCache_;
    PermRoleStore = _PermRoleStore_;
    eventCode = _eventCode_;
    userRole = _userRole_;
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

    spyOn($cookies, 'getObject').and.returnValue(undefined);
    spyOn($cookies, 'putObject');
    spyOn($cookies, 'remove');
  });

  describe('authStateChanged', function () {
    beforeEach(function () {
      spyOn($rootScope, '$broadcast');
    });

    it('broadcasts logged-in event if there is a current user', function () {
      Session._user = user;
      Session._authStateChanged();
      expect($rootScope.$broadcast).toHaveBeenCalledWith(eventCode.LOGGED_IN, user);
    });

    it('broadcasts logged-out event if there is no current user', function () {
      Session._user = null;
      Session._authStateChanged();
      expect($rootScope.$broadcast).toHaveBeenCalledWith(eventCode.LOGGED_OUT);
    });
  });

  describe('check', function () {
    beforeEach(function () {
      spyOn(Session, 'clear').and.callThrough();
      spyOn(Session, 'update').and.callThrough();
    });

    it('rejects if no current user', function (done) {
      Session._user = null;
      Session.check()
        .catch(function () {
          expect(Session.clear).toHaveBeenCalled();
          expect(Session.update).not.toHaveBeenCalled();
          $httpBackend.verifyNoOutstandingRequest();
          done();
        });
      $timeout.flush();
    });

    it('rejects if user is unable to load his record', function (done) {
      Session._user = user;
      $httpBackend.whenGET(/users/g).respond(401, {
        error: 'Auth token expired.'
      });
      Session.check()
        .catch(function () {
          expect(Session.clear).toHaveBeenCalled();
          expect(Session.update).not.toHaveBeenCalled();
          $httpBackend.verifyNoOutstandingRequest();
          done();
        });
      $httpBackend.flush();
    });

    it('resolves if user is able to load his record', function (done) {
      Session._user = user;
      $httpBackend.whenGET(/users/g).respond(user);
      Session.check()
        .then(function () {
          expect(Session.clear).not.toHaveBeenCalled();
          expect(Session.update).toHaveBeenCalledWith(user);
          $httpBackend.verifyNoOutstandingRequest();
          done();
        });
      $httpBackend.flush();
    });
  });

  describe('get', function () {
    it('returns the current session state', function () {
      Session._user = user;
      expect(Session.get()).toEqual(user);
    });
  });

  describe('getToken', function () {
    it('returns the current session token', function () {
      Session._user = user;
      expect(Session.getToken()).toEqual(user._token);
    });
  });

  describe('update', function () {
    var newUser;

    beforeEach(function () {
      newUser = _.chain(user).clone().mapValues(function (value) {
        return 'new' + value;
      }).value();
      spyOn(Session, '_authStateChanged').and.callThrough();
    });

    it('updates the cookie', function () {
      Session.update(newUser);
      expect($cookies.putObject).toHaveBeenCalledWith('user', newUser);
    });

    it('updates state', function () {
      Session.update(newUser);
      expect(Session._user).toEqual(newUser);
    });

    it('triggers auth state change event', function () {
      Session.update(newUser);
      expect(Session._authStateChanged).toHaveBeenCalled();
    });
  });

  describe('clear', function () {
    beforeEach(function () {
      spyOn(Session, '_authStateChanged').and.callThrough();
    });

    it('clears the cookie', function () {
      Session.clear();
      expect($cookies.remove).toHaveBeenCalledWith('user');
    });

    it('updates state', function () {
      Session.clear();
      expect(Session._user).toBeNull();
    });

    it('triggers auth state change event', function () {
      Session.clear();
      expect(Session._authStateChanged).toHaveBeenCalled();
    });
  });

  describe('defineRoles', function () {
    beforeEach(function () {
      Session._user = _.clone(user);
      spyOn(PermRoleStore, 'clearStore');
      spyOn(PermRoleStore, 'defineRole');
    });

    it('clears store', function () {
      Session.defineRoles();
      expect(PermRoleStore.clearStore).toHaveBeenCalled();
    });

    it('detects a user', function () {
      Session._user.role = userRole.User;
      Session.defineRoles();
      expect(PermRoleStore.defineRole).toHaveBeenCalledWith('USER', []);
    });

    it('detects an admin', function () {
      Session._user.role = userRole.Admin;
      Session.defineRoles();
      expect(PermRoleStore.defineRole).toHaveBeenCalledWith('ADMIN', []);
    });

    it('detects a manager', function () {
      Session._user.role = userRole.Manager;
      Session.defineRoles();
      expect(PermRoleStore.defineRole).toHaveBeenCalledWith('MANAGER', []);
    });

    it('detects an unauthenticated session', function () {
      Session._user = null;
      Session.defineRoles();
      expect(PermRoleStore.defineRole).toHaveBeenCalledWith('UNAUTHENTICATED', []);
    });
  });

  describe('is[Role]', function () {
    beforeEach(function () {
      Session._user = _.clone(user);
    });

    it('detects an admin', function () {
      Session._user.role = userRole.Admin;
      expect(Session.isAdmin()).toBe(true);
      expect(Session.isManager()).toBe(false);
      expect(Session.isUser()).toBe(false);
    });

    it('detects a manager', function () {
      Session._user.role = userRole.Manager;
      expect(Session.isAdmin()).toBe(false);
      expect(Session.isManager()).toBe(true);
      expect(Session.isUser()).toBe(false);
    });

    it('detects a user', function () {
      Session._user.role = userRole.User;
      expect(Session.isAdmin()).toBe(false);
      expect(Session.isManager()).toBe(false);
      expect(Session.isUser()).toBe(true);
    });
  });
});
