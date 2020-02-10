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

/**
 * Some elements (e.g. in the search view) are replaced very quickly. It may occur that a command like
 * "(await driver.findElement(x)).click()" crashes as the element has been removed
 * after being found, but before being clicked. To circumvent this issue, this function
 * just retries until the element wasn't removed between find and click.
 * @param {object} driver initialized driver
 * @param {By} selector to find element with
 * @returns {void}
 */
async function reclickUntilNotStale (driver, selector) {
    let error;

    do {
        error = null;
        try {
            await (await driver.findElement(selector)).click();
        }
        catch (e) {
            error = e;
            await driver.wait(new Promise(r => setTimeout(r, 100)));
        }
    } while (error !== null);
}

module.exports = {
    getTextOfElements,
    centersTo,
    clickFeature,
    hoverFeature,
    reclickUntilNotStale
};
