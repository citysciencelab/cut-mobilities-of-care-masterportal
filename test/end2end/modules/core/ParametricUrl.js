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
                expect(center).to.have.ordered.members([566465.123, 5935135.123]);
            });

        });
    });
   /*
  *  ------------------- query -----------------------------------------------------------------------------
  */
    test.describe("query", function () {
        test.it("should find \"Neuenfelder Straße,19\" in Searchbar input", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//input[@id='searchInput' and @value='NeuenfelderStraße,19']")), 9000);
            var hit = driver.findElement(webdriver.By.xpath("//input[@id='searchInput' and @value='NeuenfelderStraße,19']"));
            expect(hit).to.exist;
        });
    });
    test.describe("query", function () {
        test.it("should center to Neuenfelder Straße,19", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//input[@id='searchInput' and @value='NeuenfelderStraße,19']")), 9000);
            var center;

            function getCenter () {
              center = Backbone.Radio.request("MapView", "getCenter");
              return center;
            }

            driver.executeScript(getCenter).then(function (center) {
                expect(center).to.have.ordered.members([566610.464, 5928085.662]);
            });

        });
    });
  });
}
module.exports = ParametricUrlTests;
