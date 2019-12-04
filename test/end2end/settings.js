const webdriver = require("selenium-webdriver"),
    capabilities = {
        firefox: {"browserName": "firefox", acceptSslCerts: true, acceptInsecureCerts: true},
        chrome: webdriver.Capabilities.chrome(),
        ie: webdriver.Capabilities.ie()
    },
    resolutions = [
        "1024x768"
        // "600x800"
    ],
    configs = new Map([
        // ["CT", "/test/end2end/resources/configs/custom"], // CT = Custom Tree (like portal/masterTree)
        ["DT", "/test/end2end/resources/configs/default"], // DT = Default Tree (like portal/master)
        // ["LT", "/test/end2end/resources/configs/basic"] // LT = Light Tree (like portal/basic)
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
    return resolution === resolutions[1];
}

/**
 * Returns true for url indicating basic (LT) configuration.
 * @param {String} url url in use
 * @returns {boolean} whether configuration is basic
 */
function isBasic (url) {
    return url.includes(configs.get("LT"));
}

/**
 * Produces browserstack configurations.
 * @param {String} browserstackuser username
 * @param {String} browserstackkey key
 * @param {String} resolution as WIDTHxHEIGHT
 * @returns {Array} array of bs configuration objects
 */
function getBsCapabilities (browserstackuser, browserstackkey, resolution) {
    return [
        {
            "browserName": "Chrome",
            "browser_version": "74.0",
            "os": "Windows",
            "os_version": "10",
            "resolution": resolution,
            "project": "MasterPortal",
            "browserstack.local": true,
            "browserstack.user": browserstackuser,
            "browserstack.key": browserstackkey
        },
        {
            "browserName": "Safari",
            "browser_version": "12.0",
            "os": "OS X",
            "os_version": "Mojave",
            "resolution": resolution,
            "project": "MasterPortal",
            "browserstack.local": true,
            "browserstack.user": browserstackuser,
            "browserstack.key": browserstackkey
        }
    ];
}

module.exports = {
    capabilities,
    resolutions,
    configs,
    modes,
    isMobile,
    isBasic,
    getBsCapabilities
};
