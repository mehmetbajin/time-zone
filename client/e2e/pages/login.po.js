'use strict';

const EC = protractor.ExpectedConditions;

const LoginPage = function () {
  this.email = element(by.css('input[name="email"]'));
  this.password = element(by.css('input[name="password"]'));
  this.forgotPassword = element(by.css('.forgot-password'));
  this.login = element(by.css('.submit-button'));
  this.register = element(by.css('.register > a'));

  this.waitUntilVisible = function () {
    browser.wait(EC.visibilityOf(this.email), 5000);
    browser.wait(EC.visibilityOf(this.password), 5000);
    browser.wait(EC.visibilityOf(this.forgotPassword), 5000);
    browser.wait(EC.visibilityOf(this.login), 5000);
    browser.wait(EC.visibilityOf(this.register), 5000);
  };
};

module.exports = new LoginPage();
