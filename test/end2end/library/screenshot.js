// TODO fix
/* eslint-disable */

/**
 * Writes screenshot as png file to test/end2end/Screenshots.
 * @param {*} data data to write
 * @param {?String} [name="ss.png"] file name for screenshot
 */
function writeScreenshot (data, name = "ss.png") {
    throw new Error("refactor me");
    const filePath = `test\\end2end\\Screenshots\\ScreenshotsTest\\${name}`;
    fs.writeFileSync(filePath, data, "base64");
}

module.exports = {
    writeScreenshot
};
