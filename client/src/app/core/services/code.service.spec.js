'use strict';

describe('service: Code', function () {
  var Code;
  var $httpBackend;
  var $templateCache;
  var apiUrl;

  var codes;

  beforeEach(module('app'));

  beforeEach(inject(function (_Code_, _$httpBackend_, _$templateCache_, _apiUrl_) {
    Code = _Code_;
    $httpBackend = _$httpBackend_;
    $templateCache = _$templateCache_;
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
    codes = [{
      name: 'GMT Standard Time',
      offset: '+00:00',
      _id: '-KVcqgLb3Xy6CXbEKRLh'
    }, {
      name: 'Greenwich Standard Time',
      offset: '+00:00',
      _id: '-KVcqgLde1ApfQl91Y9a'
    }];
  });

  describe('get', function () {
    beforeEach(function () {
      $httpBackend.whenGET(apiUrl + '/codes').respond(codes);
    });

    it('loads all codes from server the first time', function (done) {
      $httpBackend.expectGET(apiUrl + '/codes');
      Code.get()
        .then(function (_codes_) {
          expect(_codes_).toEqual(codes);
          done();
        });
      $httpBackend.flush();
    });

    it('loads codes from cache after first load', function (done) {
      Code.get()
        .then(function () {
          return Code.get();
        })
        .then(function (_codes_) {
          expect(_codes_).toEqual(codes);
          $httpBackend.verifyNoOutstandingRequest();
          done();
        });
      $httpBackend.flush(1);
    });
  });
});
