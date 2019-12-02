const {until, By} = require("selenium-webdriver");

/**
 * Prepares the driver for testing.
 * @param {selenium-webdriver.Builder} builder builder for current driver
 * @param {String} url to get
 * @param {String} resolution formatted as "AxB" with A, B integers
 * @returns {selenium.webdriver.Driver} driver instance
 */
async function initDriver (builder, url, resolution) {
    const driver = await builder.build(),
        widthHeight = resolution.split("x").map(x => parseInt(x, 10));

    await driver.get(url);
    await driver.manage().window().setRect({width: widthHeight[0], height: widthHeight[1]});
    await driver.wait(until.elementLocated(By.id("loader")), 50000);

    return driver;
}

module.exports = {
    initDriver
};
