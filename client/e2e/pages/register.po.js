'use strict';

const EC = protractor.ExpectedConditions;

const RegisterPage = function () {
  this.name = element(by.css('input[name="name"]'));
  this.email = element(by.css('input[name="email"]'));
  this.password = element(by.css('input[name="password"]'));
  this.register = element(by.css('.submit-button'));
  this.login = element(by.css('.login > a'));

  this.waitUntilVisible = function () {
    browser.wait(EC.visibilityOf(this.name), 5000);
    browser.wait(EC.visibilityOf(this.email), 5000);
    browser.wait(EC.visibilityOf(this.password), 5000);
    browser.wait(EC.visibilityOf(this.register), 5000);
    browser.wait(EC.visibilityOf(this.login), 5000);
  };
};

module.exports = new RegisterPage();
