var expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    until = webdriver.until,
    By = webdriver.By,
    loader;

function ZoomTests (driver) {
    driver.wait(until.elementLocated(By.id("loader")), 50000);
    loader = driver.findElement(By.id("loader"));
    test.describe("ZoomFunctions", function () {
        var minus,
            plus;

        test.it("should have plusbutton", function () {


            driver.wait(until.elementLocated(By.css("span.glyphicon.glyphicon-plus")), 50000);
            plus = driver.findElement(By.xpath("//div[@class='zoomButtons']/span[@class='glyphicon glyphicon-plus']"));

            expect(plus).to.exist;
        });

        test.it("should zoom in after click plusbutton", function () {
            var  resolution;

            driver.executeScript(getResolution).then(function (res) {
                resolution = res;
                plus.click();
            });

            driver.executeScript(getResolution).then(function (res) {
                expect(resolution).to.be.above(res);
            });

        });

        test.it("should have minusbutton", function () {

            minus = driver.findElement(By.xpath("//div[@class='zoomButtons']/span[@class='glyphicon glyphicon-minus']"));


            expect(minus).to.exist;
        });

        test.it("should zoom out after click minusbutton", function () {
            var resolution;

            driver.executeScript(getResolution).then(function (res) {
                resolution = res;
                minus.click();
            });

            driver.executeScript(getResolution).then(function (res) {
                expect(resolution).to.be.below(res);
            });

        });
    });
}


function getResolution () {
    var resolution = Backbone.Radio.request("MapView", "getOptions").resolution;

    return resolution;
}

module.exports = ZoomTests;
