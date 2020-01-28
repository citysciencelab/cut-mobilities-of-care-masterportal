const fs = require("fs-extra"),
    zipAFolder = require("zip-a-folder"),
    path = require("path"),

    rootPath = path.resolve(__dirname, "../../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))(),
    destinationFolder = path.resolve(rootPath, "dist/examples_" + stableVersionNumber),
    portal = {
        name: "Basic",
        source: "./dist/basic",
        mastercode: "./dist/mastercode"
    };

/**
 * Deletes unwanted css asset files from addons
 * @returns {void}
 */
function removeAddonCssFiles () {
    const folderToCheck = destinationFolder + "/mastercode/" + stableVersionNumber + "/css/";

    fs.readdir(folderToCheck, async (err, files) => {
        if (err) {
            throw new Error("ERROR", err);
        }
        for (const file of files) {
            if (file !== "masterportal.css" && file !== "woffs") {
                await fs.remove(folderToCheck + file);
            }
        }
        removeAddonJsFiles();
    });

}

/**
 * Deletes unwanted js asset files from addons
 * @returns {void}
 */
function removeAddonJsFiles () {
    const folderToCheck = destinationFolder + "/mastercode/" + stableVersionNumber + "/js/";

    fs.readdir(folderToCheck, async (err, files) => {
        if (err) {
            throw new Error("ERROR", err);
        }
        for (const file of files) {
            if (file !== "masterportal.js") {
                await fs.remove(folderToCheck + file);
            }
        }
        zipAFolder.zip(destinationFolder, destinationFolder + ".zip");
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
