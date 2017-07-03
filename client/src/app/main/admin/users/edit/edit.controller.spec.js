'use strict';

describe('controller: UserEditController', function () {
  var vm;

  var $controller;
  var $mdDialog;

  var user;
  var defaultUser;

  beforeEach(module('app'));

  beforeEach(inject(function (_$controller_, _$mdDialog_) {
    $controller = _$controller_;
    $mdDialog = _$mdDialog_;
  }));

  beforeEach(function () {
    user = {
      _id: 'id',
      _token: 'token',
      name: 'name',
      email: 'email',
      role: 10
    };

    defaultUser = {
      role: null,
      name: '',
      email: '',
      password: ''
    };

    spyOn($mdDialog, 'hide');
    spyOn($mdDialog, 'cancel');

    vm = $controller('UserEditController', {
      user: user
    });
  });

  it('detects an edit', function () {
    expect(vm.editing).toBe(true);
    expect(vm.user).toEqual(user);
  });

  it('detects an add', function () {
    vm = $controller('UserEditController', {
      user: null
    });
    expect(vm.editing).toBe(false);
    expect(vm.user).toEqual(defaultUser);
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
    expect($mdDialog.hide).toHaveBeenCalledWith(user);
  });
});
