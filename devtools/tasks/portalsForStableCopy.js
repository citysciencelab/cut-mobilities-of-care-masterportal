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

var confPortalConfigs = {};

function copyPortal (portalName) {
    fs.readdir(conf.sourceFolder + "/" + portalName, (error, fileNames) => {
        if (!fileNames.length) {
            console.error("Source folder " + conf.sourceFolder + "/" + portalName + " was empty");
            return;
        }
        fileNames.forEach((sourceFile, index) => {
            fs.copy(conf.sourceFolder + "/" + portalName + "/" + sourceFile, conf.targetFolder + "/" + portalName + "/" + sourceFile).then(() => {
                portalsForStableReplace(conf.targetFolder + "/" + portalName + "/" + sourceFile, conf.stableVersion);
                if (index === fileNames.length - 1) {
                    console.log("Finished building portal \"" + portalName + "\"");
                }
            }).catch((copyError) => {
                console.error(copyError);
            });
        });
    });
}

function buildCustomModulesPortal (portalName) {
    var command = "webpack --config devtools/webpack.prod.js --CUSTOMMODULE ../" + conf.sourceFolder + "/" + portalName + "/" + confPortalConfigs.customModules[portalName].replace(/\.js$/, ""),
        redundantCustomModuleDataPath = confPortalConfigs.customModules[portalName].split("/")[0];

    console.log("Executing script " + command);
    execute(command).then(function () {
        console.log("Finished script " + command);
        fs.copy(conf.tempPortalFolder, conf.targetFolder + "/" + portalName).then(() => {
            fs.copy(conf.sourceFolder + "/" + portalName + "/", conf.targetFolder + "/" + portalName).then(() => {
                fs.remove(conf.targetFolder + "/" + portalName + "/" + redundantCustomModuleDataPath).then(() => {
                    replaceUrlsForCustomModules(conf.environment, conf.targetFolder + "/" + portalName, portalName === "geo-online" ? 3 : 2);
                    console.log("Finished building portal \"" + portalName + "\"");
                });
            });
        });
    }).catch((error) => {
        console.error(error);
    });
}

function createStablePortalsFolder () {
    console.log("Started building portals");
    fs.readdir(conf.sourceFolder, (error, portalNames) => {
        if (!portalNames.length) {
            console.error("No source folders available in folder " + conf.sourceFolder);
        }
        portalNames.forEach((portalName) => {
            if (confPortalConfigs.modulesBlackList.indexOf(portalName) !== -1) {
                console.log("Ignored portal \"" + portalName + "\" (blacklisted)");
                return;
            }
            if (portalName === ".git" || portalName.match(/^\./) !== null) {
                console.log("Ignored hidden folder " + conf.targetFolder + "/" + portalName);
                return;
            }
            if (fs.statSync(conf.sourceFolder + "/" + portalName).isDirectory() === false) {
                console.log("Ignored file " + conf.targetFolder + "/" + portalName);
                return;
            }
            fs.mkdirs(conf.targetFolder + "/" + portalName).then(() => {
                if (confPortalConfigs.customModules[portalName] === undefined) {
                    copyPortal(portalName);
                }
                else {
                    buildCustomModulesPortal(portalName);
                }
            }).catch((mkdirError) => {
                console.error(mkdirError);
            });
        });
    });
}

function createMasterCodeFolder () {
    var foldersToCopy = ["js", "css"];

    console.log("Started creating MasterCode folder");
    fs.mkdirs(conf.masterCodeFolder).then(() => {
        foldersToCopy.forEach((folderToCopy, index) => {
            fs.mkdirs(conf.masterCodeFolder + "/" + folderToCopy).then(() => {
                console.log("Created folder " + conf.masterCodeFolder + "/" + folderToCopy);
                fs.copy(conf.basicPortalFolder + "/" + folderToCopy, conf.masterCodeFolder + "/" + folderToCopy).then(() => {
                    replaceInFile.sync({
                        "files": conf.masterCodeFolder + "/css/style.css",
                        "from": /\/*(\.+\/)*lgv-config/g,
                        "to": "../../../lgv-config"
                    });
                    if (index === foldersToCopy.length - 1) {
                        console.log("Finished creating MasterCode folder");
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
        console.log("Deleted folder " + process.cwd() + "/" + conf.targetFolder);
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
        console.log("Folder \"" + answers.confPortalConfigsFolder + "\" is not a directory.");
        return;
    }
    confPortalConfigs = require(process.cwd() + "/" + answers.confPortalConfigsFolder + "/buildStablePortalsConfig.js");

    if (answers.checkDelete.toUpperCase() === "Y") {
        console.log("\n----------------------------------------------\n");
        deleteStablePortalsFolder();
    }
});