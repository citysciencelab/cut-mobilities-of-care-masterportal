var assert = require("chai").assert,
    expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    fs = require("fs"),
    until = webdriver.until,
    loader,
    driver;

function ZoomTests (driver) {
        loader = driver.findElement(webdriver.By.id("loader"));
        test.describe("ZoomFunctions", function () {
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

              driver.executeScript(getResolution).then(function (resolution) {
                  this.resolution = resolution;
                  minus.click();
              });

              driver.executeScript(getResolution).then(function (resolution) {
                  expect(this.resolution).to.be.below(resolution);
              });

          });

          // test.it("should zoom out after scrollout", function () {
          //             driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
          //                 resolution;

          //             function getResolution () {
          //               resolution = Backbone.Radio.request("MapView", "getResolution").resolution;
          //               return resolution;
          //             };

          //             driver.executeScript(getResolution).then(function (resolution) {
          //                 this.resolution = resolution;
          //                 driver.executeScript("window.scrollBy(500,500)");
          //             });

          //             driver.executeScript(getResolution).then(function (resolution) {
          //                expect(this.resolution).to.be.below(resolution);
          //             });

          //         });

      });
};

  function getCenter () {
      center = Backbone.Radio.request("MapView", "getCenter");
      return center;
  };

  function getResolution () {
      resolution = Backbone.Radio.request("MapView", "getResolution").resolution;
      return resolution;
  };

  function writeScreenshot (data, name) {
    name = name || "ss.png";
    var screenshotPath = "test\\end2end\\Screenshots\\ScreenshotsTest\\";

    fs.writeFileSync(screenshotPath + name, data, "base64");
  };

module.exports = ZoomTests