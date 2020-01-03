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

module.exports = {
    getTextOfElements
};
