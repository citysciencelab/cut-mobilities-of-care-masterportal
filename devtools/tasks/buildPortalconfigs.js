const fs = require("fs-extra"),
    stableVersion = require("../../package.json").version.replace(/\./g, "_"),
    portalsForStableReplace = require("./buildPortalconfigsReplace"),
    execute = require("child-process-promise").exec,
    replaceStrings = require("./replace"),

    conf = {
        sourceFolder: "portalconfigs",
        targetFolder: "dist/builtPortals",
        stableVersion: stableVersion,
        masterCodeFolder: "dist/builtPortals/Mastercode/" + stableVersion,

        // folder where custom modules creation script saves its result
        tempPortalFolder: "dist/build",
        basicPortalFolder: "dist/Basic"
    },
    confPortalConfigs = require("../../" + conf.sourceFolder + "/conf-buildPortalconfigs.js");

/**
 * copy a portal without custom module
 * @param {String} portalName name from portal
 * @param {String[]} aPortalQueue contains names of portals to build
 * @returns {void}
 */
function copyPortal (portalName, aPortalQueue) {
    fs.readdir(conf.sourceFolder + "/" + portalName, (error, fileNames) => {
        if (fileNames === undefined || !fileNames.length) {
            console.error("ERROR: Source folder " + conf.sourceFolder + "/" + portalName + " was empty");
            return;
        }
        fileNames.forEach((sourceFile, index) => {
            fs.copy(conf.sourceFolder + "/" + portalName + "/" + sourceFile, conf.targetFolder + "/" + portalName + "/" + sourceFile).then(() => {
                portalsForStableReplace(conf.targetFolder + "/" + portalName + "/" + sourceFile, conf.stableVersion);
                if (index === fileNames.length - 1) {
                    console.warn("NOTICE: Portal finished building: \"" + portalName + "\"");
                    // eslint-disable-next-line no-use-before-define
                    createPortalsRec(aPortalQueue);
                }
            }).catch((copyError) => {
                console.error("ERROR: " + copyError);
            });
        });
    });
}

/**
 * build recursively portals from queue
 * @param {String[]} aPortalQueue contains names of portals to build
 * @returns {void}
 */
function createPortalsRec (aPortalQueue) {
    var portalName,
        command;

    if (aPortalQueue.length === 0) {
        fs.remove(conf.tempPortalFolder).catch(error => console.error(error));
        return;
    }

    portalName = aPortalQueue.shift();

    if (confPortalConfigs.customModules[portalName] === undefined || confPortalConfigs.customModules[portalName].initFile === undefined) {
        copyPortal(portalName, aPortalQueue);
    }
    else {
        command = "webpack --config devtools/webpack.prod.js --CUSTOMMODULE " + confPortalConfigs.customModules[portalName].initFile;

        console.warn("NOTICE: Executing script: " + command);
        execute(command).then(function () {
            console.warn("NOTICE: Finished script execution");
            fs.copy(conf.tempPortalFolder, conf.targetFolder + "/" + portalName).then(() => {
                fs.copy(conf.sourceFolder + "/" + portalName + "/", conf.targetFolder + "/" + portalName).then(() => {
                    replaceStrings(conf.targetFolder + "/" + portalName);
                    if (Array.isArray(confPortalConfigs.customModules[portalName].ignoreList) && confPortalConfigs.customModules[portalName].ignoreList.length > 0) {
                        confPortalConfigs.customModules[portalName].ignoreList.forEach(fileOrFolder => {
                            fs.remove(conf.targetFolder + "/" + portalName + "/" + fileOrFolder);
                        });
                    }

                    console.warn("NOTICE: Portal finished building: \"" + portalName + "\"");
                    createPortalsRec(aPortalQueue);
                });
            });
        }).catch((error) => {
            console.warn("EEROR: " + error);
        });
    }
}

/**
 * fill create portal queue
 * @returns {void}
 */
function createPortalsFolder () {
    var aPortalQueue = [];

    fs.readdir(conf.sourceFolder, (error, portalNames) => {
        if (!portalNames.length) {
            console.error("ERROR: No source folders available in folder " + conf.sourceFolder);
        }
        portalNames.forEach((portalName) => {
            if (confPortalConfigs.modulesBlackList.indexOf(portalName) !== -1) {
                console.warn("NOTICE: Ignored portal \"" + portalName + "\" (blacklisted)");
                return;
            }
            if (portalName === ".git" || portalName.match(/^\./) !== null) {
                console.warn("NOTICE: Ignored hidden folder " + conf.sourceFolder + "/" + portalName);
                return;
            }
            // eslint-disable-next-line no-sync
            if (fs.statSync(conf.sourceFolder + "/" + portalName).isDirectory() === false) {
                console.warn("NOTICE: Ignored file " + conf.sourceFolder + "/" + portalName);
                return;
            }
            fs.mkdirs(conf.targetFolder + "/" + portalName).catch((mkdirError) => {
                console.error("ERROR: " + mkdirError);
            });
            aPortalQueue.push(portalName);

        });

        createPortalsRec(aPortalQueue);
    });
}

/**
 * creates the mastercode
 * @returns {void}
 */
function createMasterCodeFolder () {
    var foldersToCopy = ["js", "css"];

    console.warn("NOTICE: Started creating MasterCode folder");
    fs.mkdirs(conf.masterCodeFolder).then(() => {
        foldersToCopy.forEach((folderToCopy, index) => {
            fs.mkdirs(conf.masterCodeFolder + "/" + folderToCopy).then(() => {
                console.warn("NOTICE: Created folder " + conf.masterCodeFolder + "/" + folderToCopy);
                fs.copy(conf.basicPortalFolder + "/" + folderToCopy, conf.masterCodeFolder + "/" + folderToCopy).then(() => {
                    if (index === foldersToCopy.length - 1) {
                        console.warn("NOTICE: Finished creating MasterCode folder");
                        createPortalsFolder();
                    }
                });
            }).catch((error) => {
                console.error(error);
            });
        });
    }).catch((error) => {
        console.error(error);
    });
}

/**
 *  deletes the folder if this is already existing
 * @returns {void}
 */
function deleteStablePortalsFolder () {
    fs.remove(conf.targetFolder).then(() => {
        console.warn("NOTICE: Deleted folder " + process.cwd() + "/" + conf.targetFolder);
        createMasterCodeFolder();
    });
}

deleteStablePortalsFolder();