const fs = require("fs-extra"),
    zipAFolder = require("zip-a-folder"),
    path = require("path"),

    rootPath = path.resolve(__dirname, "../../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))();

/**
 * zips a given folder and deletes it afterwards
 * @param {String} folder folder to be zipped
 * @returns {void}
 */
function zipFolder (folder) {
    zipAFolder.zip(folder, folder + ".zip").then(() => {
        // fs.remove(folder).catch(error => console.error(error));
    });
}

/**
 * Removes js and css files created for addons
 * @param {String} folder folder check
 * @returns {void}
 */
function removeAddonFiles (folder) {
    let folderToCheck;

    ["js", "css"].forEach(suffix => {
        folderToCheck = folder + "/mastercode/" + stableVersionNumber + "/" + suffix + "/";

        fs.readdir(folderToCheck, (err, files) => {
            if (err) {
                throw new Error("ERROR", err);
            }

            files.forEach(file => {
                if (file !== "masterportal." + suffix && file !== "woffs") {
                    fs.remove(folderToCheck + file);
                }
            });
        });
    });

    zipFolder(folder);
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
                fs.copy(portal.mastercode, folder + "/mastercode").then(() => {
                    removeAddonFiles(folder);
                }).catch(err => console.error(err));
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
    const folders = ["dist/examples_" + stableVersionNumber],
        portal = {
            name: "Basic",
            source: "./dist/basic",
            mastercode: "./dist/mastercode"
        };

    removeFolders(folders, portal);
}

console.warn("create example folders, copy portal and dependencies");
createFolderStructure();
