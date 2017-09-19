var webdriver = require("selenium-webdriver"),
    path = require('path'),
    tests = require( path.resolve( __dirname, "./tests.js" ) ),
    driver,
    driver_chrome,
    driver_ff,
    loader;

//driver_ff = new webdriver.Builder().withCapabilities(webdriver.Capabilities.firefox()).build();
//Tests(driver_ff);

driver_chrome = new webdriver.Builder().withCapabilities(webdriver.Capabilities.chrome()).build();

tests(driver_chrome);

