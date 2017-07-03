'use strict';

describe('Register', () => {
  let page;
  let user;

  beforeEach(() => {
    browser.driver.get('http://localhost:3000/');
    browser.manage().deleteCookie('user');
  });

  beforeEach(() => {
    browser.get('/main/pages/register');
    page = require('./register.po');
    page.waitUntilVisible();
  });

  beforeEach(() => {
    user = {
      name: 'e2e test',
      email: 'e2e-test-register@nowhere.null',
      password: '123412341234'
    };
  });

  it('navigates to login page when login link is clicked', () => {
    page.login.click();
    expect(browser.getCurrentUrl()).toContain('/main/pages/login');
  });

  it('disables register button by default', () => {
    expect(page.register.isEnabled()).toBe(false);
  });

  it('disables register button if email is invalid', () => {
    page.name.sendKeys(user.name);
    page.email.sendKeys('junk');
    page.password.sendKeys(user.password);
    expect(page.register.isEnabled()).toBe(false);
  });

  it('disables register button if password is not long enough', () => {
    page.name.sendKeys(user.name);
    page.email.sendKeys(user.email);
    page.password.sendKeys('junk');
    expect(page.register.isEnabled()).toBe(false);
  });

  it('enables register button when a valid name, email, and password have been entered', () => {
    page.name.sendKeys(user.name);
    page.email.sendKeys(user.email);
    page.password.sendKeys(user.password);
    expect(page.register.isEnabled()).toBe(true);
  });

  it('registers user and logs in', () => {
    page.name.sendKeys(user.name);
    page.email.sendKeys(user.email);
    page.password.sendKeys(user.password);
    page.register.click();
    expect(browser.getCurrentUrl()).toContain('/main/account/profile');
  });
});
