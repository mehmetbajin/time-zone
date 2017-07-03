'use strict';

describe('service: Util', function () {
  var Util;
  var $templateCache;
  var $mdToast;
  var $timeout;
  var $q;

  beforeEach(module('app'));

  beforeEach(inject(function (_Util_, _$templateCache_, _$mdToast_, _$timeout_, _$q_) {
    Util = _Util_;
    $templateCache = _$templateCache_;
    $mdToast = _$mdToast_;
    $timeout = _$timeout_;
    $q = _$q_;
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

  describe('toast', function () {
    beforeEach(function () {
      spyOn($mdToast, 'hide').and.callThrough();
      spyOn($mdToast, 'showSimple');
    });

    it('does nothing if payload is an empty string', function () {
      Util.toast('');
      $timeout.flush();
      expect($mdToast.hide).not.toHaveBeenCalled();
      expect($mdToast.showSimple).not.toHaveBeenCalled();
    });

    it('does nothing if payload is an empty object', function () {
      Util.toast({});
      $timeout.flush();
      expect($mdToast.hide).not.toHaveBeenCalled();
      expect($mdToast.showSimple).not.toHaveBeenCalled();
    });

    it('hides any existing toast and shows a new one if payload is a valid string', function () {
      Util.toast('error');
      $timeout.flush();
      expect($mdToast.hide).toHaveBeenCalled();
      expect($mdToast.showSimple).toHaveBeenCalledWith('error');
    });

    it('hides any existing toast and shows a new one if payload is a valid object', function () {
      Util.toast({
        error: 'error'
      });
      $timeout.flush();
      expect($mdToast.hide).toHaveBeenCalled();
      expect($mdToast.showSimple).toHaveBeenCalledWith('error');
    });
  });

  describe('asQ', function () {
    var httpDeferred;
    var onSuccess;
    var onFailure;

    beforeEach(function () {
      httpDeferred = $q.defer();
      onSuccess = jasmine.createSpy('asQ::onSuccess');
      onFailure = jasmine.createSpy('asQ::onFailure');
    });

    it('invokes success handler on success', function (done) {
      Util.asQ(httpDeferred.promise, onSuccess, onFailure)
        .then(function (result) {
          expect(result).toEqual('success');
          expect(onSuccess).toHaveBeenCalledWith('success');
          expect(onFailure).not.toHaveBeenCalled();
          done();
        });
      httpDeferred.resolve({
        data: 'success'
      });
      $timeout.flush();
    });

    it('invokes failure handler on failure', function (done) {
      Util.asQ(httpDeferred.promise, onSuccess, onFailure)
        .catch(function (result) {
          expect(result).toEqual('failure');
          expect(onSuccess).not.toHaveBeenCalled();
          expect(onFailure).toHaveBeenCalledWith('failure');
          done();
        });
      httpDeferred.reject({
        data: 'failure'
      });
      $timeout.flush();
    });
  });
});
