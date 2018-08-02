var expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    until = webdriver.until,
    loader;

function ParametricUrlTests (driver) {
    test.describe("ParametricUrl", function () {
    /*
      *  ------------------- ZoomLevel -----------------------------------------------------------------------------
      */
        test.describe("zoomLevel", function () {
            test.before(function () {
                driver.get("https://localhost:9001/portal/master?layerIDs=717,1562&visibility=true,true&transparency=0,0&center=566465.123,5935135.123&zoomlevel=6&query=Neuenfelder Straße,19");
                loader = driver.findElement(webdriver.By.id("loader"));
                driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            });
            test.it("should take zoomLevel = 6 from ParametricUrl", function () {
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
                var hit, value;

                driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
                driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//input[@id='searchInput']")), 15000);
                hit = driver.findElement(webdriver.By.xpath("//input[@id='searchInput']")).getAttribute("value");

                function getValue () {
                    value = document.getElementById("searchInput").value;
                    return value;
                }

                driver.executeScript(getValue).then(function (value) {
                    expect(value).to.equal("Neuenfelder Straße,19");
                });
            });
        });
        /*
      *  ------------------- Style -----------------------------------------------------------------------------
      */
        test.describe("Style", function () {
            test.describe("Table-Style", function () {
                test.before(function () {
                    driver.get("https://localhost:9001/portal/master?style=table");
                    loader = driver.findElement(webdriver.By.id("loader"));
                    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
                });
                test.it("should find main nav hidden with Style=table", function () {
                    var visible;

                    function isMainNavVisible () {
                        visible = $(".main-nav").is(":visible");
                        return visible;
                    }

                    driver.executeScript(isMainNavVisible).then(function (visible) {
                        expect(visible).to.equal(false);
                    });
                });
                test.it("should find table-nav with Style=table", function () {
                    var tablenav;

                    driver.wait(webdriver.until.elementLocated(webdriver.By.id("table-nav-main")), 9000);
                    tablenav = driver.findElement(webdriver.By.id("table-nav-main"));

                    expect(tablenav).to.exist;
                });
            });
            test.describe("Simple-Style", function () {
                test.before(function () {
                    driver.get("https://localhost:9001/portal/master?style=simple");
                    loader = driver.findElement(webdriver.By.id("loader"));
                    driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
                });
                test.it("should find main nav hidden with Style=simple", function () {
                    var visible;

                    function isMainNavVisible () {
                        visible = $(".main-nav").is(":visible");
                        return visible;
                    }

                    driver.executeScript(isMainNavVisible).then(function (visible) {
                        expect(visible).to.equal(false);
                    });
                });
            });
        });
    });
}
module.exports = ParametricUrlTests;
