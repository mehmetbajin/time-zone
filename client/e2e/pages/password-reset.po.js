'use strict';

const EC = protractor.ExpectedConditions;

const PasswordResetPage = function () {
  this.email = element(by.css('input[name="email"]'));
  this.reset = element(by.css('.submit-button'));
  this.login = element(by.css('.login > a'));

  this.waitUntilVisible = function () {
    browser.wait(EC.visibilityOf(this.email), 5000);
    browser.wait(EC.visibilityOf(this.reset), 5000);
    browser.wait(EC.visibilityOf(this.login), 5000);
  };
};

module.exports = new PasswordResetPage();
