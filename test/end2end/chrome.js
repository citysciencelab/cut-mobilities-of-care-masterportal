var assert = require("chai").assert,
    expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    fs = require("fs"),
    until = webdriver.until,
    driver,
    driver_chrome,
    driver_ff,
    loader;

//driver_ff = new webdriver.Builder().withCapabilities(webdriver.Capabilities.firefox()).build();
//Tests(driver_ff);

driver_chrome = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

Tests(driver_chrome);

function Tests (driver) {
  test.describe("MasterTests", function () {
      this.timeout(25000);
      test.before(function () {
          /* runs before the first it() is executed */
          driver.get("http://localhost:9001/portal/master");
          loader = driver.findElement(webdriver.By.id("loader"));
      });

  /*
  *  ------------------- Zoomen -----------------------------------------------------------------------------
  */
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


  /*
  *  ------------------- Fullscreen -----------------------------------------------------------------------------
  */
      test.describe("Fullscreen", function () {
          var fullscreen;

          test.it("should have Fullscreenbutton", function () {
              driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");
              driver.wait(webdriver.until.elementLocated(webdriver.By.xpath("//div[@id='fullScreen']/div/span")), 9000);
              fullscreen = driver.findElement(webdriver.By.xpath("//div[@id='fullScreen']/div/span"));

              expect(fullscreen).to.exist;
          });

          test.it("should switch to fullscreen after click fullscreenbutton", function () {
              driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");

              fullscreen.click();

              driver.takeScreenshot().then(function (data) {
                writeScreenshot(data, "Fullscreen.png");
              });

              driver.executeScript(checkFullscreen).then(function (fullscreen) {
                  expect(fullscreen).to.be.true;
              });
          });

          test.it("should switch back to normalscreen after click fullscreenbutton again", function () {
              driver.wait(until.elementIsNotVisible(loader), 50000, "Loader nach timeout noch sichtbar");

              fullscreen.click();

              driver.takeScreenshot().then(function (data) {
                writeScreenshot(data, "FullscreenBack.png");
              });

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
  *  ------------------- Search-----------------------------------------------------------------------------
  */
      test.describe("Search", function () {
          var searchbar, searchbutton, hit, center;

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
              driver.wait(webdriver.until.elementLocated(webdriver.By.id("base-modal")), 9000);
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

  /*
  *  ------------------- Browser schließen-----------------------------------------------------------------------------
  */
      test.after(function () {
          driver.quit();
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

  function writeScreenshot (data, name) {
    name = name || "ss.png";
    var screenshotPath = "test\\end2end\\Screenshots\\ScreenshotsTest\\";

    fs.writeFileSync(screenshotPath + name, data, "base64");
  };

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
}