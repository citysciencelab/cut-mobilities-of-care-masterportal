var expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    until = webdriver.until,
    loader;

function ParametricUrlTests (driver) {
  loader = driver.findElement(webdriver.By.id("loader"));

  test.describe("ParametricUrl", function () {
/*
  *  ------------------- ZoomLevel -----------------------------------------------------------------------------
  */
    test.describe("zoomLevel", function () {
        test.it("should take zoomLevel = 6 from ParametricUrl", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            var zoomLevel;

            function getZoomLevel () {
              zoomLevel = Backbone.Radio.request("MapView", "getZoomLevel");
              return zoomLevel;
            }

            driver.executeScript(getZoomLevel).then(function (zoomLevel) {
              expect(zoomLevel).to.equal(6);
            });

        });
    });
    /*
  *  ------------------- Center -----------------------------------------------------------------------------
  */
    test.describe("center", function () {
        test.it("should take center=566465.123,5935135.123 from ParametricUrl", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            var center;

            function getCenter () {
              center = Backbone.Radio.request("MapView", "getCenter");
              return center;
            }

            driver.executeScript(getCenter).then(function (center) {
              expect(center).to.be.equal([566465.123,5935135.123]);
            });

        });
    });
  });
}

module.exports = ParametricUrlTests;
