'use strict';

describe('run: Index', function () {
  var $rootScope;
  var $state;
  var $timeout;
  var $templateCache;

  beforeEach(module('app'));

  beforeEach(inject(function (_$rootScope_, _$state_, _$timeout_, _$templateCache_) {
    $rootScope = _$rootScope_;
    $state = _$state_;
    $timeout = _$timeout_;
    $templateCache = _$templateCache_;
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
    // angular-permissions issue workaround
    $state.current = _.assign($state.current, {
      '$$permissionState': function () {
        return {};
      }
    });
  });

  it('saves state object to root scope', function () {
    expect($rootScope.state).toEqual($state);
  });

  it('enables loading progress when state transitions start', function () {
    $rootScope.$broadcast('$stateChangeStart', $state.current, {}, $state.current, {});
    expect($rootScope.loadingProgress).toBe(true);
  });

  it('disables loading progress when state transitions succeed', function () {
    $rootScope.$broadcast('$stateChangeSuccess', $state.current, {}, $state.current, {});
    $timeout.flush();
    expect($rootScope.loadingProgress).toBe(false);
  });
});
