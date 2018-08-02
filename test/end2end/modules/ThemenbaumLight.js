var assert = require("chai").assert,
    expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    fs = require("fs"),
    until = webdriver.until,
    loader,
    driver;

function ThemenbaumLightTests (driver) {
    loader = driver.findElement(webdriver.By.id("loader"));

    test.describe("ThemenbaumLight", function () {
  		var themenButton, Baumelement;

  		test.it("should have Themen in Menubar", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            themenButton = driver.findElement(webdriver.By.xpath("//a[span[text()='Themen']]")),
            expect(themenButton).to.exist;
        });
  		test.it("should open after click in Menubar", function () {
            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
            themenButton.click();

            driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//ul[@id='tree']")));
            var baum = driver.findElement(webdriver.By.xpath("//ul[@id='tree']"));

            expect(baum).to.exist;
        });
  		test.it("should switch on Layer Verkehrskameras after click", function () {

            driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");

            driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//ul[@id='tree']")));
            Baumelement = driver.findElement(webdriver.By.xpath("//span[span[text()='Verkehrskameras']]"));

            Baumelement.click();
            driver.takeScreenshot().then(function (data) {
                writeScreenshot(data, "VerkehrskamerasOn.png");
            });

            expect(Baumelement).to.exist;
        });
    });
}

function getCenter () {
    center = Backbone.Radio.request("MapView", "getCenter");
    return center;
}

function writeScreenshot (data, name) {
    name = name || "ss.png";
    var screenshotPath = "test\\end2end\\Screenshots\\ScreenshotsTest\\";

    fs.writeFileSync(screenshotPath + name, data, "base64");
}

function checkFullscreen () {
    var fullscreen,
        windowValue = window.innerHeight,
        screenValue = screen.height;

    if (windowValue == screenValue) {
        fullscreen = true;
    }
    else {
        fullscreen = false;
    }
    return fullscreen;
}

module.exports = ThemenbaumLightTests;