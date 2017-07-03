'use strict';

describe('PasswordSet', () => {
  let page;

  beforeEach(() => {
    browser.driver.get('http://localhost:3000/');
    browser.manage().deleteCookie('user');
  });

  describe('with oobCode', () => {
    beforeEach(() => {
      browser.get('/main/pages/password-set?oobCode=thisisacode');
      page = require('./password-set.po');
      page.waitUntilVisible();
    });

    it('disables set button by default', () => {
      expect(page.set.isEnabled()).toBe(false);
    });

    it('disables set button if password is not long enough', () => {
      page.password.sendKeys('junk');
      expect(page.set.isEnabled()).toBe(false);
    });

    it('enables set button when a valid password has been entered', () => {
      page.password.sendKeys('123412341234');
      expect(page.set.isEnabled()).toBe(true);
    });
  });

  describe('without oobCode', () => {
    beforeEach(() => {
      browser.get('/main/pages/password-set');
      page = require('./password-set.po');
      page.waitUntilVisible();
    });

    it('disables all form controls', () => {
      expect(page.password.isEnabled()).toBe(false);
      expect(page.set.isEnabled()).toBe(false);
    });
  });
});
