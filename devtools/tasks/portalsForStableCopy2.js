const fs = require("fs-extra"),
    path = require("path"),
    _ = require("underscore"),
    replaceInFile = require("replace-in-file"),
    stableVersion = require("../../package.json").version.replace(/\./g, "_"),
    portalsForStableReplace = require("./portalsForStableReplace2"),
    execute = require("child-process-promise").exec,
    replaceStrings = require("./replace2");

var
    conf = {
        sourceFolder: "portalconfigs",
        sourceFiles: ["config.js", "config.json", "index.html"],
        targetFolder: "stablePortale",
        masterCodeFolder: "stablePortale/Mastercode/"+stableVersion,
        tempPortalFolder: "dist/build",
        basicPortalFolder: "dist/Basic",
        customModules: {
            boris: "bodenrichtwertabfrage/view",
            flaecheninfo: "showParcelGFI",
            sga: "gfionaddress/view",
            verkehrsportal: "customModule"
        },
        environment: "Internet"
    };

function deleteStablePortalsFolder () {
    fs.remove(conf.targetFolder).then(() => {
        console.log("Deleted folder "+process.cwd()+"/"+conf.targetFolder);
        createMasterCodeFolder();
    });
}

function createMasterCodeFolder () {
    var foldersToCopy = ["js", "css"];
    console.log("Started creating MasterCode folder");
    fs.mkdirs(conf.masterCodeFolder).then(() => {
        foldersToCopy.forEach((folderToCopy, index) => {
            fs.mkdirs(conf.masterCodeFolder+"/"+folderToCopy).then(() => {
                console.log("Created folder "+conf.masterCodeFolder+"/"+folderToCopy);
                fs.copy(conf.basicPortalFolder+"/"+folderToCopy, conf.masterCodeFolder+"/"+folderToCopy).then(() => {
                    replaceInFile.sync({
                        "files": conf.masterCodeFolder+"/css/style.css",
                        "from": /\/*(\.+\/)*lgv-config/g,
                        "to": "../../../lgv-config"
                    });
                    if (index === foldersToCopy.length -1) {
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

function copyPortal (portalName) {
    fs.readdir(conf.sourceFolder+"/"+portalName, (error, fileNames) => {
        if (!fileNames.length) {
            console.error("Source folder "+conf.sourceFolder+"/"+portalName+" was empty");
            return;
        }
        fileNames.forEach((sourceFile, index) => {
            fs.copy(conf.sourceFolder+"/"+portalName+"/"+sourceFile, conf.targetFolder+"/"+portalName+"/"+sourceFile).then(() => {
                portalsForStableReplace(conf.targetFolder+"/"+portalName+"/"+sourceFile, stableVersion);
                if (index === fileNames.length -1)  {
                    console.log("Finished building portal \""+portalName+"\"");
                }
            }).catch((error) => {
                console.error(error);
            });
        });
    });
}

function buildCustomModulesPortal (portalName) {
    var command = "webpack --config devtools/webpack.prod.js --CUSTOMMODULE ../"+conf.sourceFolder+"/"+portalName+"/"+conf.customModules[portalName],
        redundantCustomModuleDataPath = conf.customModules[portalName].split("/")[0];

    console.log("Executing script "+command);
    execute(command).then(function (result) {
        console.log("Finished script "+command);
        fs.copy(conf.tempPortalFolder, conf.targetFolder+"/"+portalName).then(() => {
            fs.copy(conf.sourceFolder+"/"+portalName+"/", conf.targetFolder+"/"+portalName).then(() => {
                fs.remove(conf.targetFolder+"/"+portalName+"/"+redundantCustomModuleDataPath).then(() => {
                    replaceStrings(conf.environment, conf.targetFolder+"/"+portalName, portalName === "geo-online" ? 3 : 2);
                    console.log("Finished building portal \""+portalName+"\"");
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
            console.error("No source folders available in folder "+conf.sourceFolder);
        }
        portalNames.forEach((portalName, index) => {
            if (fs.statSync(conf.sourceFolder+"/"+portalName).isDirectory() === false) {
                console.log("Ignored file "+conf.targetFolder+"/"+portalName);
                return;
            }
            if (portalName === ".git" || portalName.match(/^\./) !== null) {
                console.log("Ignored folder "+conf.targetFolder+"/"+portalName);
                return;
            }
            fs.mkdirs(conf.targetFolder+"/"+portalName).then(() => {
                if (conf.customModules[portalName] === undefined) {
                    copyPortal(portalName);
                }
                else {
                    buildCustomModulesPortal(portalName);
                }
            }).catch((error) => {
                console.error(error);
            });
        });
    });
}

const inquirer = require("inquirer"),
    questions = [{
        type: "input",
        name: "checkDelete",
        message: "This script will DELETE the following folder:\n"+process.cwd()+"/"+conf.targetFolder+"\nContinue? (Y/N)",
        default: "N"
    }];
inquirer.prompt(questions).then(function (answers) {
    if (answers.checkDelete.toUpperCase() === "Y") {
        console.log("\n----------------------------------------------\n");
        deleteStablePortalsFolder();
    }
});





