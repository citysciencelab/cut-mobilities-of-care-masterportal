const {getCenter, setCenter} = require("./scripts.js"),
    {By} = require("selenium-webdriver");

/**
 * Get Text from webdriver elements.
 * @param {Array} elements Elements containing text
 * @returns {Promise} Promise which resolves with an array containing the texts
 */
function getTextOfElements (elements) {
    const textPromises = [];

    for (const element of elements) {
        textPromises.push(element.getText());
    }
    return Promise.all(textPromises);
}

/**
 * @param {object} driver current driver instance
 * @param {Number[]} target expected coordinates
 * @returns {boolean} true if driver eventually center to given target
 */
async function centersTo (driver, target) {
    try {
        await driver.wait(async () => {
            const center = await driver.executeScript(getCenter);

            return center[0] === target[0] && center[1] === target[1];
        });
        return true;
    }
    catch (e) {
        return false;
    }
}

/**
 * Clicks a feature by centering and then clicking the viewport's center.
 * @param {object} driver initialized driver
 * @param {Number[]} coordinates coordinates to jump to and click on
 * @returns {void}
 */
async function clickFeature (driver, coordinates) {
    const viewport = await driver.findElement(By.css(".ol-viewport"));

    await driver.executeScript(setCenter, coordinates);
    await driver.actions({bridge: true})
        .move({origin: viewport})
        .click()
        .perform();
}

/**
 * Hovering a feature by centering and then hovering the viewport's center.
 * @param {object} driver initialized driver
 * @param {Number[]} coordinates coordinates to jump to and hover over
 * @returns {void}
 */
async function hoverFeature (driver, coordinates) {
    const viewport = await driver.findElement(By.css(".ol-viewport"));

    await driver.executeScript(setCenter, coordinates);
    await driver.actions({bridge: true})
        .move({origin: viewport})
        .perform();
}

module.exports = {
    getTextOfElements,
    centersTo,
    clickFeature,
    hoverFeature
};
