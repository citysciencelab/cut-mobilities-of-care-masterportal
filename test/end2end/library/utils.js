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
    let center;

    try {
        await driver.wait(async () => {
            center = await driver.executeScript(getCenter);

            return center[0] === target[0] && center[1] === target[1];
        }, 5000, `Map was not centered to ${target}; last coordinate: ${center}.`);
        return true;
    }
    catch (e) {
        return false;
    }
}

/**
 * @param {object} driver current driver instance
 * @param {Number[]} target expected coordinates
 * @returns {boolean} true if driver eventually loses center to given target
 */
async function losesCenter (driver, target) {
    let center;

    try {
        await driver.wait(async () => {
            center = await driver.executeScript(getCenter);

            return center[0] !== target[0] || center[1] !== target[1];
        }, 5000, `Map remained on center ${target}.`);
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
    await viewport.click();
}

/**
 * Hovering a feature by centering and then hovering the viewport's center.
 * @param {object} driver initialized driver
 * @param {Number[]} coordinates coordinates to jump to and hover over
 * @param {?object} spread if available, is spread within a first move; e.g. use to start hovering from another point {x: -10, y: -10}
 * @returns {void}
 */
async function hoverFeature (driver, coordinates, spread = null) {
    const viewport = await driver.findElement(By.css(".ol-viewport"));

    await driver.executeScript(setCenter, coordinates);

    let actions = driver.actions({bridge: true});

    if (spread) {
        actions = actions.move({origin: viewport, ...spread});
    }

    actions = actions.move({origin: viewport});
    await actions.perform();
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
    let error,
        counter = 0;

    do {
        error = null;
        counter++;
        try {
            await (await driver.findElement(selector)).click();
        }
        catch (e) {
            error = e;
            await driver.wait(new Promise(r => setTimeout(r, 100)));
        }
    } while (error !== null && counter < 10);

    if (error) {
        console.error(`reclickUntilNotStale reclicked ${counter} times, but was not successful.`);
        throw error;
    }
}

module.exports = {
    getTextOfElements,
    centersTo,
    losesCenter,
    clickFeature,
    hoverFeature,
    reclickUntilNotStale
};
