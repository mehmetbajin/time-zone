'use strict';

describe('controller: ProfileController', function () {
  var vm;
  var user;

  beforeEach(module('app'));

  beforeEach(inject(function ($controller) {
    user = {
      _id: 'id',
      _token: 'token',
      name: 'name',
      email: 'email',
      role: 10
    };

    vm = $controller('ProfileController', {
      user: user
    });
  }));

  it('caches user', function () {
    expect(vm.user).toEqual(user);
  });
});
