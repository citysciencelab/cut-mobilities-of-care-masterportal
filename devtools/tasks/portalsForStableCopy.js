const fs = require("fs-extra"),
    // portal version parsed from package.json file
    stableVersion = require("../../package.json").version.replace(/\./g, "_"),

    replaceInFile = require("replace-in-file"),
    // replace URLs in regular module files, based on replace-in-file
    portalsForStableReplace = require("./portalsForStableReplace"),
    // replace URLs in custom module files, based on replace-in-file
    replaceUrlsForCustomModules = require("./replace"),
    // execute shell commands
    execute = require("child-process-promise").exec,

    conf = {
        confPortalConfigsFolder: "portalconfigs",
        sourceFolder: "portalconfigs",
        targetFolder: "stablePortale",
        stableVersion: stableVersion,
        masterCodeFolder: "stablePortale/Mastercode/" + stableVersion,
        environment: "Internet",

        // folder where custom modules creation script saves its result
        tempPortalFolder: "dist/build",
        basicPortalFolder: "dist/Basic"
    };

var aPortalQueue = [],
    confPortalConfigs = {};

function createPortalsRec () {
    var portalName,
        command;

    if (aPortalQueue.length === 0) {
        return;
    }

    portalName = aPortalQueue.shift();

    if (confPortalConfigs.customModules[portalName] === undefined || confPortalConfigs.customModules[portalName].initFile === undefined) {
        copyPortal(portalName);
    }
    else {
        command = "webpack --config devtools/webpack.prod.js --CUSTOMMODULE " + confPortalConfigs.customModules[portalName].initFile;

        console.log("NOTICE: Executing script: " + command);
        execute(command).then(function () {
            console.log("NOTICE: Finished script execution");
            fs.copy(conf.tempPortalFolder, conf.targetFolder + "/" + portalName).then(() => {
                fs.copy(conf.sourceFolder + "/" + portalName + "/", conf.targetFolder + "/" + portalName).then(() => {
                    replaceUrlsForCustomModules(conf.environment, conf.targetFolder + "/" + portalName, portalName === "geo-online" ? 3 : 2);
                    if (Array.isArray(confPortalConfigs.customModules[portalName].ignoreList) && confPortalConfigs.customModules[portalName].ignoreList.length > 0) {
                        confPortalConfigs.customModules[portalName].ignoreList.forEach(fileOrFolder => {
                            fs.remove(conf.targetFolder + "/" + portalName + "/" + fileOrFolder);
                        });
                    }

                    console.log("NOTICE: Portal finished building: \"" + portalName + "\"");
                    createPortalsRec();
                });
            });
        }).catch((error) => {
            console.log("EEROR: " + error);
        });
    }
}

function copyPortal (portalName) {
    fs.readdir(conf.sourceFolder + "/" + portalName, (error, fileNames) => {
        if (!fileNames.length) {
            console.error("ERROR: Source folder " + conf.sourceFolder + "/" + portalName + " was empty");
            return;
        }
        fileNames.forEach((sourceFile, index) => {
            fs.copy(conf.sourceFolder + "/" + portalName + "/" + sourceFile, conf.targetFolder + "/" + portalName + "/" + sourceFile).then(() => {
                portalsForStableReplace(conf.targetFolder + "/" + portalName + "/" + sourceFile, conf.stableVersion);
                if (index === fileNames.length - 1) {
                    console.log("NOTICE: Portal finished building: \"" + portalName + "\"");
                    createPortalsRec();
                }
            }).catch((copyError) => {
                console.error("ERROR: " + copyError);
            });
        });
    });
}

function createStablePortalsFolder () {
    fs.readdir(conf.sourceFolder, (error, portalNames) => {
        if (!portalNames.length) {
            console.error("ERROR: No source folders available in folder " + conf.sourceFolder);
        }
        portalNames.forEach((portalName) => {
            if (confPortalConfigs.modulesBlackList.indexOf(portalName) !== -1) {
                console.log("NOTICE: Ignored portal \"" + portalName + "\" (blacklisted)");
                return;
            }
            if (portalName === ".git" || portalName.match(/^\./) !== null) {
                console.log("NOTICE: Ignored hidden folder " + conf.sourceFolder + "/" + portalName);
                return;
            }
            if (fs.statSync(conf.sourceFolder + "/" + portalName).isDirectory() === false) {
                console.log("NOTICE: Ignored file " + conf.sourceFolder + "/" + portalName);
                return;
            }
            fs.mkdirs(conf.targetFolder + "/" + portalName).catch((mkdirError) => {
                console.error("ERROR: " + mkdirError);
            });
            aPortalQueue.push(portalName);

        });

        createPortalsRec();
    });
}

function createMasterCodeFolder () {
    var foldersToCopy = ["js", "css"];

    console.log("NOTICE: Started creating MasterCode folder");
    fs.mkdirs(conf.masterCodeFolder).then(() => {
        foldersToCopy.forEach((folderToCopy, index) => {
            fs.mkdirs(conf.masterCodeFolder + "/" + folderToCopy).then(() => {
                console.log("NOTICE: Created folder " + conf.masterCodeFolder + "/" + folderToCopy);
                fs.copy(conf.basicPortalFolder + "/" + folderToCopy, conf.masterCodeFolder + "/" + folderToCopy).then(() => {
                    replaceInFile.sync({
                        "files": conf.masterCodeFolder + "/css/style.css",
                        "from": /\/*(\.+\/)*lgv-config/g,
                        "to": "../../../lgv-config"
                    });
                    if (index === foldersToCopy.length - 1) {
                        console.log("NOTICE: Finished creating MasterCode folder");
                        createStablePortalsFolder();
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

function deleteStablePortalsFolder () {
    fs.remove(conf.targetFolder).then(() => {
        console.log("NOTICE: Deleted folder " + process.cwd() + "/" + conf.targetFolder);
        createMasterCodeFolder();
    });
}

const inquirer = require("inquirer"),
    questions = [{
        type: "input",
        name: "confPortalConfigsFolder",
        message: "Please locate the folder containing the \"buildStablePortalsConfig.js\" file.",
        default: conf.confPortalConfigsFolder
    }, {
        type: "input",
        name: "checkDelete",
        message: "This script will DELETE the following folder:\n" + process.cwd() + "/" + conf.targetFolder + "\nContinue? (Y/N)",
        default: "N"
    }];

inquirer.prompt(questions).then(function (answers) {
    if (fs.statSync(answers.confPortalConfigsFolder).isDirectory() === false) {
        console.log("ERROR: \"" + answers.confPortalConfigsFolder + "\" is not a directory.");
        return;
    }
    confPortalConfigs = require(process.cwd() + "/" + answers.confPortalConfigsFolder + "/buildStablePortalsConfig.js");

    if (answers.checkDelete.toUpperCase() === "Y") {
        console.log("NOTICE: Executing script");
        deleteStablePortalsFolder();
    }
});
