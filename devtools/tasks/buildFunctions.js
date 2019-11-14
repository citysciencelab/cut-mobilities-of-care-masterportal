const fs = require("fs-extra"),
    replaceStrings = require("./replace"),
    prependVersionNumber = require("./prependVersionNumber"),
    path = require("path"),
    execute = require("child-process-promise").exec,

    rootPath = path.resolve(__dirname, "../../"),
    portalconfigsFolderPath = path.resolve(rootPath, "portalconfigs/"),
    buildTempPath = path.resolve(rootPath, "dist/build/");


/**
 * copy files to the given destination
 * @param {String} sourcePortalPath source of the built portal
 * @param {String} distPortalPath destination folder for the built portal
 * @returns {void}
 */
function copyFiles (sourcePortalPath, distPortalPath) {
    fs.copy(sourcePortalPath, distPortalPath).then(() => {
        console.warn("NOTE: Successfully Copied \"" + sourcePortalPath + "\" to \"" + distPortalPath + "\".");
        fs.copy("./img", distPortalPath + "/img").then(() => {
            console.warn("NOTE: Successfully copied \"./img\" to \"" + distPortalPath + "\".");
            fs.copy(buildTempPath, distPortalPath).then(() => {
                fs.remove(buildTempPath).then(() => {
                    replaceStrings(distPortalPath);
                    console.warn("NOTE: Successfully copied \"" + buildTempPath + "\" to \"" + distPortalPath + "\".");
                }).catch(error => console.error(error));
            }).catch(error => console.error(error));
        }).catch(error => console.error(error));
    }).catch(error => console.error(error));
}

/**
 * remove files if if they already exist.
 * @param {String} sourcePortalPath source of the built portal
 * @param {String} distPortalPath destination folder for the built portal
 * @returns {void}
 */
function removeOldBuiltFiles (sourcePortalPath, distPortalPath) {
    fs.remove(distPortalPath).then(() => {
        console.warn("NOTE: Successfully deleted \"" + distPortalPath + "\" directory.");
        copyFiles(sourcePortalPath, distPortalPath);
    }).catch(function (err) {
        throw new Error("ERROR", err);
    });
}

/**
 * start the process to build a portal with webpack
 * @param {Object} answers contains the attributes for the portal to be build
 * @returns {void}
 */
module.exports = function buildWebpack (answers) {
    const
        sourcePortalPath = path.resolve(rootPath, answers.portalPath),
        portalName = sourcePortalPath.split(path.sep).pop(),
        distPortalPath = path.resolve(rootPath, "dist/", portalName),
        cliExecCommand = "webpack --config devtools/webpack.prod.js";

    if (!fs.existsSync(sourcePortalPath)) {
        console.error("---\n---");
        throw new Error("ERROR: PATH DOES NOT EXIST \"" + sourcePortalPath + "\"\nABORTED...");
    }

    console.warn("NOTICE: executing command \"" + cliExecCommand + "\"");
    execute(cliExecCommand).then(function (result) {
        console.warn(result.stdout);
        prependVersionNumber(path.resolve(buildTempPath, "js/masterportal.js")); // TODO masterportal dynamisch machen
        removeOldBuiltFiles(sourcePortalPath, distPortalPath);
    }).catch(function (err) {
        throw new Error("ERROR", err);
    });
};


