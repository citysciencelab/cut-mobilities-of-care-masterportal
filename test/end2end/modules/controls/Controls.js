var expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    fs = require("fs"),
    until = webdriver.until,
    loader,
    driver;

function ControlTests (driver) {
    loader = driver.findElement(webdriver.By.id("loader"));

    test.describe("Controls", function () {

        /*
  *  ------------------- Fullscreen -----------------------------------------------------------------------------
  */
        test.describe("Fullscreen", function () {
            var fullscreen;

            test.it("should have Fullscreenbutton", function () {
                driver.wait(until.elementIsNotVisible(loader), 5000, "Loader nach timeout noch sichtbar");
                driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//div[@id='fullScreen']/div/span")), 9000);
                fullscreen = driver.findElement(webdriver.By.xpath("//div[@id='fullScreen']/div/span"));

                expect(fullscreen).to.exist;
            });

            test.it("should switch to fullscreen after click fullscreenbutton", function () {
                driver.wait(until.elementIsNotVisible(loader), 5000, "Loader nach timeout noch sichtbar");

                fullscreen.click();

                // driver.takeScreenshot().then(function (data) {
                //     writeScreenshot(data, "Fullscreen.png");
                // });
                driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//div[@id='fullScreen']/div/span[@class='glyphicon glyphicon-remove']")), 9000);
                driver.executeScript(checkFullscreen).then(function (fullscreen) {
                    expect(fullscreen).to.be.true;
                });

            });

            test.it("should switch back to normalscreen after click fullscreenbutton again", function () {
                driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");

                fullscreen.click();

                // driver.takeScreenshot().then(function (data) {
                //   writeScreenshot(data, "FullscreenBack.png");
                // });

                driver.executeScript(checkFullscreen).then(function (fullscreen) {
                    expect(fullscreen).to.be.false;
                });
            });
        });


        /*
  *  ------------------- Lokalisieren -----------------------------------------------------------------------------
  */
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


        /*
  *  ------------------- Attributions -----------------------------------------------------------------------------
  */
        test.describe("Attributions", function () {
            var attributionsview;

            test.it("should have Attributions Window", function () {
                attributionsview = driver.findElement(webdriver.By.css("div.attributions-view")).getText();

                expect(attributionsview).to.exist;
            });

            test.it("should have AttributionsText 'Attributierung für Fachlayer'", function () {
                var attrtext = driver.findElement(webdriver.By.xpath("//dd[span[text()='Attributierung für Fachlayer']]"));

                expect(attrtext).to.exist;
            });
        });

        /*
  *  ------------------- Pois -----------------------------------------------------------------------------
  */
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
                driver.wait(webdriver.until.elementLocated(webdriver.By.id("base-modal")), 20000);
                driver.wait(webdriver.until.elementLocated(webdriver.By.linkText("2000m")), 9000);
                var link = driver.findElement(webdriver.By.linkText("2000m")).click();

                expect(link).to.exist;
            });

            test.it("should relocate after click item", function () {

                driver.executeScript(getCenter).then(function (center) {
                    this.center = center;
                    driver.findElement(webdriver.By.xpath("//div[@id='poiList']/div/div/span")).click();
                });

                driver.executeScript(getCenter).then(function (center) {
                    expect(this.center).to.not.equal(center);
                });
            });
        });

        /*
  *  ------------------- Freeze-View  -----------------------------------------------------------------------------
  */
        test.describe("FreezeView", function () {
            var freezebutton, freezeview;

            test.it("should have FreezeView", function () {
                freezeview = driver.findElement(webdriver.By.css("div.freeze-view"));

                expect(freezeview).to.exist;
            });

            test.it("should have FreezeButton", function () {
                freezebutton = driver.findElement(webdriver.By.css("div.freeze-view-start"));

                expect(freezebutton).to.exist;
            });
        });


    });
}

function getCenter () {
    var center = Backbone.Radio.request("MapView", "getCenter");

    return center;
}

function writeScreenshot (data, name) {
    var name = name || "ss.png",
        screenshotPath = "test\\end2end\\Screenshots\\ScreenshotsTest\\";

    fs.writeFileSync(screenshotPath + name, data, "base64");
}

function checkFullscreen () {
    var fullscreen = false,
        windowValue = window.innerHeight,
        screenValue = screen.availHeight,
        tolerance = 2;

    if (windowValue >= screenValue - tolerance && windowValue <= screenValue + tolerance) {
        fullscreen = true;
    }
    return fullscreen;
}

module.exports = ControlTests;
