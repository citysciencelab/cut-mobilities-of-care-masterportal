const {getCenter} = require("./scripts.js");

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

module.exports = {
    getTextOfElements,
    centersTo
};
