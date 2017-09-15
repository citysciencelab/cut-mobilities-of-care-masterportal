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

    test.describe("LocateFunction", function () {
        var geolocateButton, center;

        test.it("should have locatebutton", function () {
            geolocateButton = driver.findElement(webdriver.By.id("geolocate")),

                expect(geolocateButton).to.exist;
        });

        test.it("map should relocate after click locatebutton", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");

            driver.executeScript(getCenter).then(function (center) {
                this.center = center;
                geolocateButton.click();
            });

            driver.executeScript(getCenter).then(function (center) {
                expect(this.center).to.not.equal(center);
            });

        });

    });

    test.describe("PoiFunction", function () {
        var poiButton, center;

        test.it("should have poibutton", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            poiButton = driver.findElement(webdriver.By.id("geolocatePOI")),
                expect(poiButton).to.exist;
        });

        test.it("should open POI-Window after click poibutton", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            poiButton.click();
            driver.wait(webdriver.until.elementLocated(webdriver.By.linkText("2000m")), 9000);
            var link = driver.findElement(webdriver.By.linkText("2000m")).click();
            expect(link).to.exist;
        });

        test.it("should relocate after click item", function () {

            function getCenter () {
                center = Backbone.Radio.request("MapView", "getCenter");
                return center;
            };

            driver.executeScript(getCenter).then(function (center) {
                this.center = center;
                driver.findElement(webdriver.By.xpath("//div[@id='poiList']/div/div/span")).click();
            });

            driver.executeScript(getCenter).then(function (center) {
                expect(this.center).to.not.equal(center);
            });
        });

    });

    test.after(function () {
        // driver.quit();
    });
});

function getCenter () {
    center = Backbone.Radio.request("MapView", "getCenter");
    return center;
};

function getResolution () {
    resolution = Backbone.Radio.request("MapView", "getResolution").resolution;
    return resolution;
};
