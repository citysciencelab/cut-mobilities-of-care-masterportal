var assert = require("chai").assert,
    expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    fs = require("fs"),
    until = webdriver.until,
    driver,
    loader;

function SuchTests (driver) {
      test.describe("Search", function () {
        var searchbar,
            searchbutton,
            hit,
            center;

          test.it("should have SearchBar", function () {
              searchbar = driver.findElement(webdriver.By.id("searchInput")),
              expect(searchbar).to.exist;
          });

          test.it("should have SearchButton", function () {
              searchButton = driver.findElement(webdriver.By.css("button.btn.btn-default.btn-search"));
              expect(searchButton).to.exist;
          });

          test.it("should find Searchhits for 'haus' in 'festgestellt' ", function () {
              searchbar.sendKeys("haus");
              searchButton.click();
              driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//li[text()='festgestellt']")), 9000);
              driver.findElement(webdriver.By.xpath("//li[text()='festgestellt']")).click();
              hit = driver.findElement(webdriver.By.id("Hausbruch1-Neugraben-Fischbek10BPlan"));
              expect(hit).to.exist;
          });

          test.it("should relocate on hit 'Hausbruch1-Neugraben-Fischbek10BPlan' in 'festgestellt' ", function () {
              driver.executeScript(getCenter).then(function (center) {
                  this.center = center;
                  hit.click();
              });

              driver.executeScript(getCenter).then(function (center) {
                  expect(this.center).to.not.equal(center);
              });
          });

          test.it("should find Searchhits for 'haus' in 'im Verfahren' ", function () {
              searchbar.clear();
              searchbar.sendKeys("haus");
              searchButton.click();
              driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//li[text()='im Verfahren']")), 9000);
              driver.findElement(webdriver.By.xpath("//li[text()='im Verfahren']")).click();
              hit = driver.findElement(webdriver.By.id("Hausbruch40BPlan"));

              expect(hit).to.exist;
          });

          test.it("should relocate on hit 'Hausbruch40BPlan' in 'im Verfahren' ", function () {
              driver.executeScript(getCenter).then(function (center) {
                  this.center = center;
                  hit.click();
              });

              driver.executeScript(getCenter).then(function (center) {
                  expect(this.center).to.not.equal(center);
              });
          });

          test.it("should find Searchhits for 'haus' in 'Krankenhaus' ", function () {
              searchbar.clear();
              searchbar.sendKeys("haus");
              searchButton.click();
              driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//li[text()='Krankenhaus']")), 9000);
              driver.findElement(webdriver.By.xpath("//li[text()='Krankenhaus']")).click();
              hit = driver.findElement(webdriver.By.id("Albertinen-Krankenhaus"));

              expect(hit).to.exist;
          });

          test.it("should relocate on hit 'Albertinen-Krankenhaus' in 'Krankenhaus' ", function () {
              driver.executeScript(getCenter).then(function (center) {
                  this.center = center;
                  hit.click();
              });

              driver.executeScript(getCenter).then(function (center) {
                  expect(this.center).to.not.equal(center);
              });
          });

           test.it("should find Searchhits for 'haus' in 'Stadtteil' ", function () {
              searchbar.clear();
              searchbar.sendKeys("haus");
              searchButton.click();
              driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//li[text()='Stadtteil']")), 9000);
              driver.findElement(webdriver.By.xpath("//li[text()='Stadtteil']")).click();
              hit = driver.findElement(webdriver.By.id("HausbruchStadtteil"));

              expect(hit).to.exist;
          });

          test.it("should relocate on hit 'HausbruchStadtteil' in 'Stadtteil' ", function () {
              driver.executeScript(getCenter).then(function (center) {
                  this.center = center;
                  hit.click();
              });

              driver.takeScreenshot().then(function (data) {
                writeScreenshot(data, "Stadtteil.png");
              });

              driver.executeScript(getCenter).then(function (center) {
                  expect(this.center).to.not.equal(center);
              });
          });

          test.it("should find Searchhits for 'haus' in 'Straße' ", function () {
              searchbar.clear();
              searchbar.sendKeys("haus");
              searchButton.click();
              driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//li[text()='Straße']")), 9000);
              driver.findElement(webdriver.By.xpath("//li[text()='Straße']")).click();
              hit = driver.findElement(webdriver.By.id("HausbrucherBahnhofstraßeStraße"));

              expect(hit).to.exist;
          });

          test.it("should relocate on hit 'HausbrucherBahnhofstraßeStraße' in 'Straße' ", function () {
              driver.executeScript(getCenter).then(function (center) {
                  this.center = center;
                  hit.click();
              });

              driver.executeScript(getCenter).then(function (center) {
                  expect(this.center).to.not.equal(center);
              });
          });
      });
  };

  function getCenter () {
      var center = Backbone.Radio.request("MapView", "getCenter");

      return center;
  }

  function writeScreenshot (data, name) {
    var name = name || "ss.png",
        screenshotPath = "test\\end2end\\Screenshots\\ScreenshotsTest\\";

    fs.writeFileSync(screenshotPath + name, data, "base64");
  }

module.exports = SuchTests;
