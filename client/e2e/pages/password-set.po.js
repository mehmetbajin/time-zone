'use strict';

const EC = protractor.ExpectedConditions;

const PasswordSetPage = function () {
  this.password = element(by.css('input[name="password"]'));
  this.set = element(by.css('.submit-button'));

  this.waitUntilVisible = function () {
    browser.wait(EC.visibilityOf(this.password), 5000);
    browser.wait(EC.visibilityOf(this.set), 5000);
  };
};

module.exports = new PasswordSetPage();
