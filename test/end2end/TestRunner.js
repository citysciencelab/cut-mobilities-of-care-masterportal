require("dotenv").config();
let webdriver = require("selenium-webdriver"),
    path = require("path"),
    http = require('http'),
    tests = require(path.resolve(__dirname, "./tests.js")),
    browser = process.env.browser || "chrome",
    browserstackuser = process.env.bs_user,
    browserstackkey = process.env.bs_key,
    proxy = process.env.proxy || '',
    url = process.env.url || "http://localhost:9001/portal/basic",
    driver;

let HttpAgent = new http.Agent({
    keepAlive: true,
});

switch (browser) {
    case "firefox":
        driver = new webdriver.Builder().
                    withCapabilities({'browserName': 'firefox', acceptSslCerts: true, acceptInsecureCerts: true}).
                    build();

                    tests(driver, url, browser);
        break;
    case "ie":
        driver = new webdriver.Builder().
                    withCapabilities(webdriver.Capabilities.ie()).
                    build();

                    tests(driver, url, browser);
        break;
    case "bs":
        let capabilities = [
            {
                'browserName' : 'Chrome',
                'browser_version' : '74.0',
                'os' : 'Windows',
                'os_version' : '10',
                'resolution' : '1024x768',
                'project': 'MasterPortal',
                'browserstack.local' : true,
                'browserstack.user' : browserstackuser,
                'browserstack.key' : browserstackkey
            },
            {
                'browserName' : 'Safari',
                'browser_version' : '12.0',
                'os' : 'OS X',
                'os_version' : 'Mojave',
                'resolution' : '1024x768',
                'project': 'MasterPortal',
                'browserstack.local' : true,
                'browserstack.user' : browserstackuser,
                'browserstack.key' : browserstackkey
            }
        ];

        for (let index in capabilities) {
            driver = new webdriver.Builder().
            usingHttpAgent(HttpAgent).
            usingServer('http://hub-cloud.browserstack.com/wd/hub').
            withCapabilities(capabilities[index]).
            usingWebDriverProxy(proxy).
            build();

            tests(driver, url, "browserstack / " + capabilities[index].browserName);
            }

        break;
    default:
        driver = new webdriver.Builder().
                    withCapabilities(webdriver.Capabilities.chrome()).
                    build();

                    tests(driver, url, browser);
        break;
};




