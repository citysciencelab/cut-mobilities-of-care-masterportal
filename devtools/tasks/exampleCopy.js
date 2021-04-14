const fs = require("fs-extra"),
    zipAFolder = require("zip-a-folder"),
    path = require("path"),

    rootPath = path.resolve(__dirname, "../../"),
    getStableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))("."),
    mastercodeVersionFolderName = require(path.resolve(rootPath, "devtools/tasks/getMastercodeVersionFolderName"))(),
    destinationFolder = path.resolve(rootPath, "dist/examples_" + mastercodeVersionFolderName),
    zipFilename1 = path.resolve(rootPath, "dist/examples.zip"),
    zipFilename2 = path.resolve(rootPath, "dist/examples-" + getStableVersionNumber + ".zip"),
    // eslint-disable-next-line no-process-env
    appendix = process.env.BITBUCKET_BRANCH ? "_" + process.env.BITBUCKET_BRANCH : "",
    portal = {
        name: "Basic",
        source: "./dist/basic" + appendix,
        mastercode: "./dist/mastercode"
    };

/**
 * Deletes unwanted css asset files from addons
 * @returns {void}
 */
function removeAddonCssFiles () {
    const folderToCheck = destinationFolder + "/mastercode/" + mastercodeVersionFolderName + "/css/";

    try {
        fs.readdir(folderToCheck, async (err, files) => {
            if (err) {
                throw new Error(err);
            }
            for (const file of files) {
                if (file !== "masterportal.css" && file !== "woffs") {
                    await fs.remove(folderToCheck + file);
                }
            }
            removeAddonJsFiles();
        });
    }
    catch (err) {
        console.error(err);
    }

}

/**
 * Deletes unwanted js asset files from addons and finally creates 2 zip files
 * @returns {void}
 */
function removeAddonJsFiles () {
    const folderToCheck = destinationFolder + "/mastercode/" + mastercodeVersionFolderName + "/js/";

    fs.readdir(folderToCheck, async (err, files) => {
        if (err) {
            throw new Error("ERROR", err);
        }
        for (const file of files) {
            if (file !== "masterportal.js") {
                await fs.remove(folderToCheck + file);
            }
        }
        zipAFolder.zip(destinationFolder, zipFilename1).then(() => {
            fs.copyFileSync(zipFilename1, zipFilename2);
        }).catch(err2 => console.error(err2));
    });

}

/**
 * creates the folder which contains the example portal
 * @returns {void}
 */
function createFolders () {
    const destinationPortalFolder = destinationFolder + "/" + portal.name;

    fs.mkdir(destinationFolder).then(() => {
        fs.mkdir(destinationPortalFolder).then(() => {
            fs.copy(portal.source, destinationPortalFolder).then(() => {
                fs.copy(portal.mastercode, destinationFolder + "/mastercode").then(() => {
                    removeAddonCssFiles();
                }).catch(err => console.error(err));
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
}

/**
 * Deletes the folders if they already exist.
 * @returns {void}
 */
function removeFolders () {
    fs.remove(destinationFolder).then(() => {
        createFolders(destinationFolder, portal);
    }).catch(err => console.error(err));
}

console.warn("create example folders, copy portal and dependencies");
removeFolders();
