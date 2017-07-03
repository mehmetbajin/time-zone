'use strict';

describe('run: Users', function () {
  var $rootScope;
  var $templateCache;
  var PermRoleStore;
  var msNavigationService;
  var eventCode;

  beforeEach(module('app'));

  beforeEach(inject(function (_$rootScope_, _$templateCache_, _PermRoleStore_, _msNavigationService_, _eventCode_) {
    $rootScope = _$rootScope_;
    $templateCache = _$templateCache_;
    PermRoleStore = _PermRoleStore_;
    msNavigationService = _msNavigationService_;
    eventCode = _eventCode_;
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
    spyOn(PermRoleStore, 'getStore').and.returnValue({});
    spyOn(msNavigationService, 'saveItem');
    spyOn(msNavigationService, 'deleteItem');
  });

  afterEach(function () {
    PermRoleStore.getStore.calls.reset();
    msNavigationService.saveItem.calls.reset();
    msNavigationService.deleteItem.calls.reset();
  });

  it('removes menu on logout', function () {
    $rootScope.$broadcast(eventCode.LOGGED_OUT);
    expect(PermRoleStore.getStore).toHaveBeenCalled();
    expect(msNavigationService.saveItem).not.toHaveBeenCalled();
    expect(msNavigationService.deleteItem).toHaveBeenCalledWith('app_main_admin.users');
  });

  it('adds menu on login if an admin', function () {
    PermRoleStore.getStore.and.returnValue({
      ADMIN: true
    });
    $rootScope.$broadcast(eventCode.LOGGED_IN);
    expect(PermRoleStore.getStore).toHaveBeenCalled();
    expect(msNavigationService.saveItem).toHaveBeenCalled();
    expect(msNavigationService.deleteItem).not.toHaveBeenCalled();
  });

  it('adds menu on login if a manager', function () {
    PermRoleStore.getStore.and.returnValue({
      MANAGER: true
    });
    $rootScope.$broadcast(eventCode.LOGGED_IN);
    expect(PermRoleStore.getStore).toHaveBeenCalled();
    expect(msNavigationService.saveItem).toHaveBeenCalled();
    expect(msNavigationService.deleteItem).not.toHaveBeenCalled();
  });

  it('removes menu on login if a user', function () {
    PermRoleStore.getStore.and.returnValue({
      USER: true
    });
    $rootScope.$broadcast(eventCode.LOGGED_IN);
    expect(PermRoleStore.getStore).toHaveBeenCalled();
    expect(msNavigationService.saveItem).not.toHaveBeenCalled();
    expect(msNavigationService.deleteItem).toHaveBeenCalledWith('app_main_admin.users');
  });
});
