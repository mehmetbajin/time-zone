'use strict';

describe('controller: IndexController', function () {
  var vm;
  var fuseTheming;

  beforeEach(module('app'));

  beforeEach(inject(function ($controller, _fuseTheming_) {
    vm = $controller('IndexController');
    fuseTheming = _fuseTheming_;
  }));

  it('caches themes', function () {
    expect(vm.themes).toEqual(fuseTheming.themes);
  });
});
