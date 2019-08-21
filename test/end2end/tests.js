var  test = require("selenium-webdriver/testing"),
    webdriver = require("selenium-webdriver"),
    path = require("path"),
    zoomtests = require(path.resolve(__dirname, "./modules/controls/Zoom.js")),
    until = webdriver.until;

    // suchtests = require(path.resolve(__dirname, "./modules/Suche.js")),
    // zoomtests = require(path.resolve(__dirname, "./modules/controls/Zoom.js")),
    // controltests = require(path.resolve(__dirname, "./modules/controls/Controls.js")),
    // parametricUrlTests = require(path.resolve(__dirname, "./modules/core/ParametricUrl.js")),
    // themenbaumlighttests = require(path.resolve(__dirname, "./modules/ThemenbaumLight.js"));

function Tests (driver, url) {
    test.describe("MasterTests", function () {
        this.timeout(25000);
        test.before(function () {
            driver.get(url);
        });

        // --- Zoom ---
        zoomtests(driver);

        // // --- Search ---
        // suchtests(driver);

        // // --- Controls ---
        // controltests(driver);

        // // --- Themenbaum ---
        // themenbaumlighttests(driver);

        // // --- ParametricUrl ---
        // parametricUrlTests(driver);

        // // --- Browser schlißen ---
        test.after(function () {
            driver.quit();
        });
    });
}

module.exports = Tests;
