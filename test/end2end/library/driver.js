const {until, By} = require("selenium-webdriver"),
    {getResolution} = require("./scripts");

/**
 * Activated 3D mode for opened Masterportal.
 * @param {selenium.webdriver.Driver} driver to manipulate
 * @returns {void}
 */
async function prepare3D (driver) { // eslint-disable-line
    // TODO set driver state to activated 3D mode
}

/**
 * Activated OB mode for opened Masterportal.
 * @param {selenium.webdriver.Driver} driver to manipulate
 * @returns {void}
 */
async function prepareOB (driver) { // eslint-disable-line
    // TODO set driver state to activated OB mode
}

/**
 * Prepares the driver for testing.
 * @param {selenium-webdriver.Builder} builder builder for current driver
 * @param {String} url to get
 * @param {String} resolution formatted as "AxB" with A, B integers
 * @param {String} mode additional instance preparation before tests can be executed
 * @returns {selenium.webdriver.Driver} driver instance
 */
async function initDriver (builder, url, resolution, mode) {
    const driver = await builder.build(),
        widthHeight = resolution.split("x").map(x => parseInt(x, 10));

    await driver.get(url);
    await driver.manage().window().setRect({width: widthHeight[0], height: widthHeight[1]});
    await driver.wait(until.elementLocated(By.id("loader")), 50000);

    // wait until resolution is ready, else Firefox will often find uninitialized Backbone initially
    await driver.wait(async () => await driver.executeScript(getResolution) !== null);

    // prepare 3D resp. OB mode for tests - 2D mode is initial mode, nothing to do
    if (mode === "3D") {
        await prepare3D(driver);
    }
    else if (mode === "OB") {
        await prepareOB(driver);
    }

    return driver;
}

module.exports = {
    initDriver
};
