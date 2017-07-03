'use strict';

describe('Login', () => {
  let page;
  let user;

  beforeEach(() => {
    browser.driver.get('http://localhost:3000/');
    browser.manage().deleteCookie('user');
  });

  beforeEach(() => {
    browser.get('/main/pages/login');
    page = require('./login.po');
    page.waitUntilVisible();
  });

  beforeEach(() => {
    user = {
      email: 'user@nowhere.null',
      password: '12341234'
    };
  });

  it('navigates to reset password page when forgot password link is clicked', () => {
    page.forgotPassword.click();
    expect(browser.getCurrentUrl()).toContain('/main/pages/password-reset');
  });

  it('navigates to register page when register link is clicked', () => {
    page.register.click();
    expect(browser.getCurrentUrl()).toContain('/main/pages/register');
  });

  it('disables login button by default', () => {
    expect(page.login.isEnabled()).toBe(false);
  });

  it('disables login button if email is invalid', () => {
    page.email.sendKeys('junk');
    page.password.sendKeys(user.password);
    expect(page.login.isEnabled()).toBe(false);
  });

  it('disables login button if password is not long enough', () => {
    page.email.sendKeys(user.email);
    page.password.sendKeys('junk');
    expect(page.login.isEnabled()).toBe(false);
  });

  it('enables login button when a valid email and password have been entered', () => {
    page.email.sendKeys(user.email);
    page.password.sendKeys(user.password);
    expect(page.login.isEnabled()).toBe(true);
  });

  it('logs user in', () => {
    page.email.sendKeys(user.email);
    page.password.sendKeys(user.password);
    page.login.click();
    expect(browser.getCurrentUrl()).toContain('/main/account/profile');
  });
});
