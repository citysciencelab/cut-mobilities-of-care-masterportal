// var assert = require("chai").assert,
//     expect = require("chai").expect,
//     webdriver = require("selenium-webdriver"),
//     driver = new webdriver.Builder().
//     withCapabilities(webdriver.Capabilities.chrome()).
//     build();

// describe("Google Search", function () {
//   it("should work", function () {


//   driver.get("http://www.google.com");

//   });
// });

var  assert = require("chai").assert,
    expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    driver,
    until = webdriver.until;

test.describe("Google Search", function () {
  this.timeout(15000);
  test.before(function () {
                /* runs before the first it() is executed */
                driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

            });

  test.it("should work", function () {
                driver.get("http://www.google.com");
                var searchBox = driver.findElement(webdriver.By.name('q'));
                searchBox.sendKeys('simple programmer');
                searchBox.getAttribute('value').then(function(value) {
                   expect(value.to.be('simple programmer'));
                });
               driver.quit();
            });
  });
