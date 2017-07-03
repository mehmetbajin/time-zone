'use strict';

describe('PasswordReset', () => {
  let page;

  beforeEach(() => {
    browser.driver.get('http://localhost:3000/');
    browser.manage().deleteCookie('user');
  });

  beforeEach(() => {
    browser.get('/main/pages/password-reset')
    page = require('./password-reset.po');
    page.waitUntilVisible();
  });

  it('navigates to login page when login link is clicked', () => {
    page.login.click();
    expect(browser.getCurrentUrl()).toContain('/main/pages/login');
  });

  it('disables reset button by default', () => {
    expect(page.reset.isEnabled()).toBe(false);
  });

  it('disables reset button if email is invalid', () => {
    page.email.sendKeys('junk');
    expect(page.reset.isEnabled()).toBe(false);
  });

  it('enables reset button when a valid email has been entered', () => {
    page.email.sendKeys('user@nowhere.null');
    expect(page.reset.isEnabled()).toBe(true);
  });
});
