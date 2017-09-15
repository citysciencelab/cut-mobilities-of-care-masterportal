var assert = require("chai").assert,
    expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    until = webdriver.until,
    driver,
    loader;

test.describe("Master in Chrome", function () {
  this.timeout(15000);
  test.before(function () {
                /* runs before the first it() is executed */
                driver = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
                driver.get("https://localhost:9001/portal/master");
                loader = driver.findElement(webdriver.By.id("loader"));
            });

  test.it("should have plusbutton", function () {
                driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
                driver.wait(webdriver.until.elementLocated(webdriver.By.css("span.glyphicon.glyphicon-plus")), 9000);
                var plus = driver.findElement(webdriver.By.css("span.glyphicon.glyphicon-plus"));

                expect(plus).to.exist;
            });

  test.it("should zoom in after click plusbutton", function () {
                driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
                var plus = driver.findElement(webdriver.By.css("span.glyphicon.glyphicon-plus")),
                    resolution;

                function getResolution () {
                  resolution = Backbone.Radio.request("MapView", "getResolution").resolution;
                  return resolution;
                };

                driver.executeScript(getResolution).then(function (resolution) {
                    this.resolution = resolution;
                    plus.click();
                });

                driver.executeScript(getResolution).then(function (resolution) {
                   expect(this.resolution).to.be.above(resolution);
                });

            });

  test.it("should have minusbutton", function () {
                driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
                var minus = driver.findElement(webdriver.By.css("span.glyphicon.glyphicon-minus"));

                expect(minus).to.exist;
            });

    test.it("should zoom out after click minusbutton", function () {
                driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
                var minus = driver.findElement(webdriver.By.css("span.glyphicon.glyphicon-minus")),
                    resolution;

                function getResolution () {
                  resolution = Backbone.Radio.request("MapView", "getResolution").resolution;
                  return resolution;
                };

                driver.executeScript(getResolution).then(function (resolution) {
                    this.resolution = resolution;
                    minus.click();
                });

                driver.executeScript(getResolution).then(function (resolution) {
                   expect(this.resolution).to.be.below(resolution);
                });

            });

  test.after(function () {
          // driver.quit();
        });
  });
