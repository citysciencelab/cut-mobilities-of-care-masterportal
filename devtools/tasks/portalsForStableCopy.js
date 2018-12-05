const fs = require("fs-extra"),
    _ = require("underscore"),
    stableVersion = require("../../package.json").version.replace(/\./g, "_"),
    portalsForStableReplace = require("./portalsForStableReplace");

function copyFiles (portals, mainFolder, folder, folderStructure) {
    var sourceFiles = ["config.js", "config.json", "index.html"];

    sourceFiles.forEach(function (sourceFile) {
        var sourceFolderPath = portals + "/" + folder + "/" + sourceFile,
            mainFolderPath = mainFolder + "/" + folder + "/" + sourceFile;

        fs.exists(sourceFolderPath, function (exists) {
            if (exists) {
                fs.copy(sourceFolderPath, mainFolderPath)
                    .then(() => {
                        portalsForStableReplace(mainFolderPath, folderStructure.name, stableVersion);
                    })
                    .catch(err => console.error(err));
            }
        });
    });
}

function createPortals (portals, mainFolder, folderStructure) {
    console.warn("Portals are copied from " + portals + "!");
    fs.readdir(portals, function (err, folders) {
        if (err) {
            console.error(portals + " was not found!", err);
        }
        folders.forEach(function (folder) {
            fs.mkdir(mainFolder + "/" + folder).then(() => {
                copyFiles(portals, mainFolder, folder, folderStructure);
            }).catch(error => console.error(error));
        });
    });
}

function createFolders (mainFolder, folder) {
    fs.mkdir(mainFolder + "/" + folder.name).then(() => {
        if (_.has(folder, "subFolder")) {
            fs.mkdir(mainFolder + "/" + folder.name + "/" + folder.subFolder.name).then(() => {
                if (_.has(folder.subFolder, "files")) {
                    folder.subFolder.files.forEach(function (file) {
                        fs.copy(folder.subFolder.source + "/" + file, mainFolder + "/" + folder.name + "/" + folder.subFolder.name + "/" + file);
                    });
                }
            }).catch(err => console.error(err));
        }
    }).catch(err => console.error(err));
}

function buildFolderStructure (mainFolder, folderStructure) {
    fs.remove(mainFolder).then(() => {
        fs.mkdir(mainFolder).then(() => {
            createFolders(mainFolder, folderStructure);
            createPortals("./portalconfigs", mainFolder, folderStructure);
            createPortals("./portal", mainFolder, folderStructure);
        });
    }).catch(err => console.error(err));
}


function creatDataStructure () {
    var mainFolder = "stablePortale",
        folderStructure = {
            name: "Mastercode",
            subFolder: {
                name: stableVersion,
                source: "./dist/Basic",
                files: [
                    "css",
                    "js"
                ]
            }
        };

    buildFolderStructure(mainFolder, folderStructure);
}

creatDataStructure();
