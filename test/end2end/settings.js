const webdriver = require("selenium-webdriver"),
    capabilities = {
        firefox: {"browserName": "firefox", acceptSslCerts: true, acceptInsecureCerts: true},
        chrome: {"browserName": "chrome", version: "88", acceptSslCerts: true, acceptInsecureCerts: true},
        ie: webdriver.Capabilities.ie()
    },
    /** TODO
     * when changing the following values, also change the functions beneath; the values there should eventually
     * be replaced with references to these arrays, but during test writing, cases are oftentimes commented out,
     * effectively changing indices lots of time; do this when all e2e tests have been written
     */
    resolutions = [
        "1920x1080"
        // "600x800"
    ],
    configs = new Map([
        ["basic", "basic"],
        ["master", "master"],
        ["custom", "masterCustom"],
        ["default", "masterDefault"]
    ]),
    modes = [
        "2D"
        // "3D",
        // "OB"
    ];

/**
 * Returns true for all resolutions marked mobile.
 * @param {String} resolution as WIDTHxHEIGHT
 * @returns {boolean} whether resolution is supposed to model mobile view
 */
function isMobile (resolution) {
    return resolution === "600x800";
}

/**
 * Returns true for 2D mode.
 * @param {String} mode to check
 * @returns {boolean} whether mode is 2D
 */
function is2D (mode) {
    return mode === "2D";
}

/**
 * Returns true for 3D mode.
 * @param {String} mode to check
 * @returns {boolean} whether mode is 3D
 */
function is3D (mode) {
    return mode === "3D";
}

/**
 * Returns true for OB mode.
 * @param {String} mode to check
 * @returns {boolean} whether mode is OB
 */
function isOB (mode) {
    return mode === "OB";
}

/**
 * Returns true for url indicating basic configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is basic
 */
function isBasic (url) {
    return url.split("?")[0].indexOf(configs.get("basic") + "_") > -1 || url.split("?")[0].endsWith(configs.get("basic"));
}

/**
 * Returns true for url indicating master configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is basic
 */
function isMaster (url) {
    // e.g. "https://test.geoportal-hamburg.de/master_BG-1320
    return url.split("?")[0].indexOf(configs.get("master") + "_") > -1 || url.split("?")[0].endsWith(configs.get("master"));
}

/**
 * Returns true for url indicating default configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is default
 */
function isDefault (url) {
    return url.split("?")[0].indexOf(configs.get("default") + "_") > -1 || url.split("?")[0].endsWith(configs.get("default"));
}

/**
 * Returns true for url indicating custom configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is custom
 */
function isCustom (url) {
    return url.split("?")[0].indexOf(configs.get("custom") + "_") > -1 || url.split("?")[0].endsWith(configs.get("custom"));
}

/**
 * Returns true for browsername indicating chrome is running.
 * @param {String} browsername is browsername or contains browsername
 * @returns {boolean} whether running browser is chrome
 */
function isChrome (browsername) {
    return browsername.toLowerCase().includes("chrome");
}

/**
 * Returns true for browsername indicating firefox is running.
 * @param {String} browsername is browsername or contains browsername
 * @returns {boolean} whether running browser is firefox
 */
function isFirefox (browsername) {
    return browsername.toLowerCase().includes("firefox");
}

/**
 * Produces browserstack or saucelabs configurations.
 * @param {String} testService "browserstack" or "saucelabs"
 * @returns {Array} array of bs configuration objects
 */
function getCapabilities (testService) {
    const baseBrowserstack = {
        // do not set selenium version here, then selenium uses the detected_language, see "Input Capabilities" of each test in browserstack
            "acceptSslCerts": true,
            "project": "MasterPortal",
            "browserstack.local": true,
            /* eslint-disable-next-line no-process-env */
            "browserstack.user": process.env.bs_user,
            /* eslint-disable-next-line no-process-env */
            "browserstack.key": process.env.bs_key,
            // resolution of device, not resolution of browser window
            "resolution": "1920x1080",
            "browserstack.debug": false,
            "browserstack.networkLogs": true,
            "browserstack.console": "verbose",
            "browserstack.idleTimeout": 300,
            // Use this capability to specify a custom delay between the execution of Selenium commands
            "browserstack.autoWait": 50,
            // is used for autologin to a webpage with a predefined username and password (login to geoportal test)
            "unhandledPromptBehavior": "ignore"
        },
        baseSaucelabs = {
            "host": "saucelabs",
            "sauce:options": {
                "screenResolution": "1920x1080",
                /* eslint-disable-next-line no-process-env */
                "username": process.env.SAUCE_USERNAME,
                /* eslint-disable-next-line no-process-env */
                "accessKey": process.env.SAUCE_ACCESS_KEY,
                "extendedDebugging": true
            }
        };

    if (testService === "browserstack") {
        return [
            {
                ...baseBrowserstack,
                "browserName": "Chrome",
                "browser_version": "89.0",
                "os": "Windows",
                "os_version": "10"
            }/*
            {
                ...base,
                "browserName": "Safari",
                "browser_version": "12.0",
                "os": "OS X",
                "os_version": "Mojave"
            }*/
        ];
    }

    return [
        {
            ...baseSaucelabs,
            "browserName": "chrome",
            "browserVersion": "89",
            "platformName": "Windows 10"
        }
    ];

}

module.exports = {
    capabilities,
    resolutions,
    configs,
    modes,
    is2D,
    is3D,
    isOB,
    isMobile,
    isChrome,
    isFirefox,
    isBasic,
    isMaster,
    isDefault,
    isCustom,
    getCapabilities
};
