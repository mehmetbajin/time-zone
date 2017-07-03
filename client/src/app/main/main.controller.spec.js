'use strict';

describe('controller: MainController', function () {
  var $rootScope;
  var $scope;

  beforeEach(module('app'));

  beforeEach(inject(function (_$rootScope_, $controller) {
    $rootScope = _$rootScope_;
    $scope = $rootScope.$new();

    $controller('MainController', {
      $scope: $scope
    });
  }));

  describe('init', function () {
    beforeEach(function () {
      spyOn($rootScope, '$broadcast').and.callThrough();
    });

    it('removes splash screen when current scope emits $viewContentAnimationEnded', function () {
      $scope.$emit('$viewContentAnimationEnded');
      expect($rootScope.$broadcast).toHaveBeenCalledWith('msSplashScreen::remove');
    });

    it('keeps splash screen if another scope emits $viewContentAnimationEnded', function () {
      $rootScope.$broadcast('$viewContentAnimationEnded');
      expect($rootScope.$broadcast).not.toHaveBeenCalledWith('msSplashScreen::remove');
    });
  });
});
