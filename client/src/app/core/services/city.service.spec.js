'use strict';

describe('service: City', function () {
  var City;
  var $httpBackend;
  var $templateCache;
  var apiUrl;

  var cities;

  beforeEach(module('app'));

  beforeEach(inject(function (_City_, _$httpBackend_, _$templateCache_, _apiUrl_) {
    City = _City_;
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
    cities = [{
      code: '-KVcqgLfn1cP245fEK1y',
      name: 'Aalborg',
      _id: '-KVcs63W4UGI5QdvXOnC'
    }, {
      code: '-KVcqgLfn1cP245fEK1y',
      name: 'Aarhus',
      _id: '-KVcs63_QCsFTbaxFOVf'
    }];
  });

  describe('get', function () {
    beforeEach(function () {
      $httpBackend.whenGET(apiUrl + '/cities').respond(cities);
    });

    it('loads all cities from server the first time', function (done) {
      $httpBackend.expectGET(apiUrl + '/cities');
      City.get()
        .then(function (_cities_) {
          expect(_cities_).toEqual(cities);
          done();
        });
      $httpBackend.flush();
    });

    it('loads cities from cache after first load', function (done) {
      City.get()
        .then(function () {
          return City.get();
        })
        .then(function (_cities_) {
          expect(_cities_).toEqual(cities);
          $httpBackend.verifyNoOutstandingRequest();
          done();
        });
      $httpBackend.flush(1);
    });
  });
});
