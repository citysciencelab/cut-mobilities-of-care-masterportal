require("dotenv").config();
var webdriver = require("selenium-webdriver"),
    path = require("path"),
    tests = require(path.resolve(__dirname, "./tests.js")),
    browser = process.env.browser || "chrome",
    browserstackuser = process.env.bs_user,
    browserstackkey = process.env.bs_key,
    proxy = process.env.proxy || '',
    url = process.env.url || "https://localhost:9001/portal/basic",
    driver;

switch (browser) {
    case "firefox":
        driver = new webdriver.Builder().
                    withCapabilities({'browserName': 'firefox', acceptSslCerts: true, acceptInsecureCerts: true}).
                    build();
        break;
    case "ie":
        driver = new webdriver.Builder().
                    withCapabilities(webdriver.Capabilities.ie()).
                    build();
        break;
    case "bs":
        var capabilities = {
            'browserName' : 'Chrome',
            'browser_version' : '74.0',
            'os' : 'Windows',
            'os_version' : '10',
            'resolution' : '1024x768',
            'browserstack.local' : true,
            'browserstack.user' : browserstackuser,
            'browserstack.key' : browserstackkey
            }

        driver = new webdriver.Builder().
                    usingServer('http://hub-cloud.browserstack.com/wd/hub').
                    withCapabilities(capabilities).
                    usingWebDriverProxy(proxy).
                    build();
        break;
    default:
        driver = new webdriver.Builder().
                    withCapabilities(webdriver.Capabilities.chrome()).
                    build();
        break;
};


tests(driver, url);

