const fs = require("fs");

/** Writes screenshot as png file to test/end2end/Screenshots.
 * @param {object} driver instance to take screenshot of
 * @param {?String} [name="ss.png"] file name for screenshot
 * @returns {void}
 */
async function writeScreenshot (driver, name = "ss.png") {
    const data = await driver.takeScreenshot(),
        filePath = `test\\end2end\\Screenshots\\ScreenshotsTest\\${name}`;

    fs.writeFileSync(filePath, data, "base64");
}

module.exports = {
    writeScreenshot
};
