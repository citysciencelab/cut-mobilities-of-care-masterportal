var assert = require("chai").assert,
    expect = require("chai").expect,
    test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    path = require("path"),
    suchtests = require(path.resolve(__dirname, "./tests/Suche.js")),
    zoomtests = require(path.resolve(__dirname, "./tests/Zoom.js")),
    controltests = require(path.resolve(__dirname, "./tests/Controls.js")),
    themenbaumlighttests = require(path.resolve(__dirname, "./tests/ThemenbaumLight.js")),
    fs = require("fs"),
    until = webdriver.until,
    driver,
    loader;

function Tests (driver) {
  test.describe("MasterTests", function () {
      this.timeout(25000);
      test.before(function () {
          /* runs before the first it() is executed */
          driver.get("https://localhost:9001/portal/master");
      });

  /*  
  *  ------------------- Zoomen -----------------------------------------------------------------------------
  */
      zoomtests(driver);
  
  /*
  *  ------------------- Search-----------------------------------------------------------------------------
  */
      suchtests(driver);

  /*
  *  ------------------- Controls-----------------------------------------------------------------------------
  */
      controltests(driver);

  /*
  *  ------------------- Themenbaum-----------------------------------------------------------------------------
  */
      themenbaumlighttests(driver);

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
  }
}

module.exports = Tests