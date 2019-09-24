const fs = require("fs-extra"),
    zipAFolder = require("zip-a-folder"),
    packageJSON = require("../../package.json");

/**
 * zips a given folder and deletes it afterwards
 * @param {String} folder folder to be zipped
 * @returns {void}
 */
function zipFolder (folder) {
    zipAFolder.zip(folder, folder + ".zip").then(() => {
        fs.remove(folder).catch(error => console.error(error));
    });
}

/**
 * creates the folder which contains the example portal
 * @param {String} folder folder to create
 * @param {Object} portal for the exmaples
 * @returns {void}
 */
function createFolders (folder, portal) {
    const destinationFolder = folder + "/" + portal.name;

    fs.mkdir(folder).then(() => {
        fs.mkdir(destinationFolder).then(() => {
            fs.copy(portal.source, destinationFolder).then(() => {
                zipFolder(folder);
            }).catch(err => console.error(err));
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
}

/**
 * Deletes the folders if they already exist.
 * @param {String[]} folders folders to create
 * @param {Object} portal portal for the exmaples
 * @returns {void}
 */
function removeFolders (folders, portal) {
    folders.forEach(function (folder) {
        fs.remove(folder).then(() => {
            createFolders(folder, portal);
        }).catch(err => console.error(err));
    });
}

/**
 * Defines the folders to be created and the portal for the examples.
 * @returns {void}
 */
function createFolderStructure () {
    const folders = ["examples", "examples-" + packageJSON.version],
        portal = {
            name: "Basic",
            source: "./dist/basic"
        };

    removeFolders(folders, portal);
}

console.warn("create example folders, copy portal and dependencies");
createFolderStructure();
