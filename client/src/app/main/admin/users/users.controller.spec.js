'use strict';

describe('controller: UsersController', function () {
  var vm;

  var $controller;
  var $templateCache;
  var $mdDialog;
  var $q;
  var $timeout;
  var $rootScope;
  var $state;
  var User;
  var Util;
  var Session;
  var Auth;

  var users;

  beforeEach(module('app'));

  beforeEach(inject(function (_$controller_, _$templateCache_, _$mdDialog_, _$q_, _$timeout_,
    _$rootScope_, _$state_, _User_, _Util_, _Session_, _Auth_) {
    $controller = _$controller_;
    $templateCache = _$templateCache_;
    $mdDialog = _$mdDialog_;
    $q = _$q_;
    $timeout = _$timeout_;
    $rootScope = _$rootScope_;
    $state = _$state_;
    User = _User_;
    Util = _Util_;
    Session = _Session_;
    Auth = _Auth_;
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

    vm = $controller('UsersController', {
      users: users
    });
  });

  describe('filter', function () {
    it('filters on role', function () {
      vm.filters.role['10'] = true;
      vm.filters.role['20'] = false;
      vm.filters.role['99'] = false;
      expect(vm.filter(users[0])).toBe(true);
      expect(vm.filter(users[1])).toBe(false);
      expect(vm.filter(users[2])).toBe(false);

      vm.filters.role['10'] = false;
      vm.filters.role['20'] = true;
      vm.filters.role['99'] = false;
      expect(vm.filter(users[0])).toBe(false);
      expect(vm.filter(users[1])).toBe(true);
      expect(vm.filter(users[2])).toBe(false);

      vm.filters.role['10'] = false;
      vm.filters.role['20'] = false;
      vm.filters.role['99'] = true;
      expect(vm.filter(users[0])).toBe(false);
      expect(vm.filter(users[1])).toBe(false);
      expect(vm.filter(users[2])).toBe(true);
    });

    it('filters on name', function () {
      vm.filters.name = '1';
      expect(vm.filter(users[0])).toBe(true);
      expect(vm.filter(users[1])).toBe(false);
      expect(vm.filter(users[2])).toBe(false);

      vm.filters.name = '2';
      expect(vm.filter(users[0])).toBe(false);
      expect(vm.filter(users[1])).toBe(true);
      expect(vm.filter(users[2])).toBe(false);

      vm.filters.name = '3';
      expect(vm.filter(users[0])).toBe(false);
      expect(vm.filter(users[1])).toBe(false);
      expect(vm.filter(users[2])).toBe(true);
    });
  });

  describe('filtered', function () {
    it('filters on role', function () {
      vm.filters.role['10'] = true;
      vm.filters.role['20'] = true;
      vm.filters.role['99'] = false;
      expect(vm.filtered()).toEqual([users[0], users[1]]);

      vm.filters.role['10'] = true;
      vm.filters.role['20'] = false;
      vm.filters.role['99'] = true;
      expect(vm.filtered()).toEqual([users[0], users[2]]);

      vm.filters.role['10'] = false;
      vm.filters.role['20'] = true;
      vm.filters.role['99'] = true;
      expect(vm.filtered()).toEqual([users[1], users[2]]);
    });

    it('filters on name', function () {
      vm.filters.name = 'name';
      expect(vm.filtered()).toEqual([users[0], users[1], users[2]]);

      vm.filters.name = '2';
      expect(vm.filtered()).toEqual([users[1]]);
    });
  });

  describe('edit', function () {
    beforeEach(function () {
      spyOn(Util, 'toast');
      vm.users = users;
      $rootScope.loadingProgress = false;
    });

    it('does nothing if already working', function () {
      spyOn($mdDialog, 'show');
      $rootScope.loadingProgress = true;
      vm.edit(null, null);
      $timeout.flush();
      expect($mdDialog.show).not.toHaveBeenCalled();
    });

    it('adds a new user', function () {
      var userToCreate = {
        name: 'name',
        email: 'email',
        role: 20,
        password: 'password'
      };
      var createdUser = _.chain(userToCreate).clone().assign({
        _id: 'id'
      }).value();
      spyOn($mdDialog, 'show').and.returnValue($q.resolve(userToCreate));
      spyOn(User, 'create').and.returnValue($q.resolve(createdUser));

      vm.edit(null, null);
      $timeout.flush();

      expect($mdDialog.show).toHaveBeenCalled();
      expect($rootScope.loadingProgress).toBe(false);
      expect(User.create).toHaveBeenCalledWith(userToCreate, userToCreate.password);
      expect(vm.users).toContain(createdUser);
      expect(Util.toast).toHaveBeenCalledWith('User added.');
    });

    it('updates an existing user', function () {
      var userToUpdate = _.clone(vm.users[1]);
      var updatedUser = _.chain(userToUpdate).clone().assign({
        name: 'NAME2'
      }).value();
      spyOn($mdDialog, 'show').and.returnValue($q.resolve(updatedUser));
      spyOn(User, 'update').and.returnValue($q.resolve(updatedUser));

      vm.edit(null, userToUpdate);
      $timeout.flush();

      expect($mdDialog.show).toHaveBeenCalled();
      expect($rootScope.loadingProgress).toBe(false);
      expect(User.update).toHaveBeenCalledWith(updatedUser);
      expect(vm.users).toContain(updatedUser);
      expect(vm.users).not.toContain(userToUpdate);
      expect(Util.toast).toHaveBeenCalledWith('User updated.');
    });

    it('removes an existing user', function () {
      var userToRemove = _.clone(vm.users[2]);
      spyOn($mdDialog, 'show').and.returnValue($q.resolve(null));
      spyOn(User, 'remove').and.returnValue($q.resolve(null));

      vm.edit(null, userToRemove);
      $timeout.flush();

      expect($mdDialog.show).toHaveBeenCalled();
      expect($rootScope.loadingProgress).toBe(false);
      expect(User.remove).toHaveBeenCalledWith(userToRemove);
      expect(vm.users).not.toContain(userToRemove);
      expect(Util.toast).toHaveBeenCalledWith('User removed.');
    });

    it('logs out if current user\'s role changes', function () {
      var userToUpdate = _.clone(vm.users[1]);
      var updatedUser = _.chain(userToUpdate).clone().assign({
        role: 10
      }).value();
      spyOn($mdDialog, 'show').and.returnValue($q.resolve(updatedUser));
      spyOn(User, 'update').and.returnValue($q.resolve(updatedUser));
      spyOn(Auth, 'logout').and.returnValue($q.resolve());
      spyOn($state, 'go').and.callThrough();

      vm.edit(null, userToUpdate);
      $timeout.flush();

      expect(Auth.logout).toHaveBeenCalled();
      expect($state.go).toHaveBeenCalledWith('app.main_pages_login');
    });
  });
});
