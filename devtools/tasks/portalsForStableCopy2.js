const fs = require("fs-extra"),
    path = require("path"),
    _ = require("underscore"),
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
        basicPortalFoldersToCopy: ["js", "css"],
        customModules: {
            boris: "bodenrichtwertabfrage/view",
            flaecheninfo: "showParcelGFI",
            sga: "gfionaddress/view",
            verkehrsportal: "customModule"
        },
        environment: "Internet"
    };

function deleteStablePortalsFolder () {
    // hardcoded to not accidently remove something unintended
    fs.remove("stablePortale").then(() => {
        createMasterCodeFolder();
    });
}

function createMasterCodeFolder () {
    fs.mkdirs(conf.masterCodeFolder).then(() => {
        conf.basicPortalFoldersToCopy.forEach(basicFolderToCopy => {
            fs.mkdirs(conf.masterCodeFolder+"/"+basicFolderToCopy).then(() => {
                fs.copy(conf.basicPortalFolder+"/"+basicFolderToCopy, conf.masterCodeFolder+"/"+basicFolderToCopy).then(() => {
                    createStablePortalsFolder();
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
    conf.sourceFiles.forEach((sourceFile) => {
        if (!fs.existsSync(conf.sourceFolder+"/"+portalName+"/"+sourceFile)) {
            return;
        }
        fs.copy(conf.sourceFolder+"/"+portalName+"/"+sourceFile, conf.targetFolder+"/"+portalName+"/"+sourceFile).then(() => {
            portalsForStableReplace(conf.targetFolder+"/"+portalName+"/"+sourceFile, stableVersion);
            console.log("FINISH REPLACE STRINGS NORMAL: "+conf.targetFolder+"/"+portalName+"/"+sourceFile);
        }).catch((error) => {
            console.error(error);
        });
    });
}

function buildCustomModulesPortal (portalName) {
    var command = "webpack --config devtools/webpack.prod.js --CUSTOMMODULE ../"+conf.sourceFolder+"/"+portalName+"/"+conf.customModules[portalName];

    execute(command).then(function (result) {
        fs.copy(conf.tempPortalFolder, conf.targetFolder+"/"+portalName).then(() => {
            fs.copy(conf.sourceFolder+"/"+portalName+"/", conf.targetFolder+"/"+portalName).then(() => {
                replaceStrings(conf.environment, conf.targetFolder+"/"+portalName);
                console.log("FINISH REPLACE STRINGS CUSTOM: "+conf.targetFolder+"/"+portalName);
            });
        });
    }).catch((error) => {
        console.error(error);
    });

}

function createStablePortalsFolder () {
    console.log("createStablePortalsFolder");

    fs.readdir(conf.sourceFolder, (error, portalNames) => {
        if (!portalNames.length) {
            console.error("No source folders available");
        }
        portalNames.forEach((portalName) => {
            if (portalName === ".git" || portalName.match(/^\./) !== null) {
                return;
            }
            console.log("START: " + portalName);
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

deleteStablePortalsFolder();
