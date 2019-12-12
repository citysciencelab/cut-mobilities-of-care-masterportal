const fs = require("fs"),
    path = "test\\end2end\\Screenshots\\ScreenshotsTest";

/** Writes screenshot as png file to test/end2end/Screenshots.
 * @param {object} driver instance to take screenshot of
 * @param {?String} [name="ss.png"] file name for screenshot
 * @returns {void}
 */
async function writeScreenshot (driver, name = "ss.png") {
    // set up path on first file load if it doesn't exist
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    const data = await driver.takeScreenshot(),
        filePath = `${path}\\${name}`;

    fs.writeFileSync(filePath, data, "base64");
}

module.exports = {
    writeScreenshot
};
