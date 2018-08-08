var webdriver = require("selenium-webdriver"),
    path = require("path"),
    tests = require(path.resolve(__dirname, "./tests.js")),
    driver,
    driver_chrome,
    driver_ff,
    driver_ie,
    loader;

// driver_ie = new webdriver.Builder().withCapabilities(webdriver.Capabilities.ie()).build();
// tests(driver_ie);

// driver_ff = new webdriver.Builder().withCapabilities(webdriver.Capabilities.firefox()).build();
// tests(driver_ff);

driver_chrome = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();
tests(driver_chrome);

