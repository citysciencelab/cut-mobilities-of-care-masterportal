const fs = require("fs-extra"),
    _ = require("underscore");

function copyFiles (folder) {
    if (_.has(folder, "files")) {
        _.each(folder.files, function (file) {
            fs.copy(folder.source + "/" + file, folder.destination + "/" + file);
        });
    }
    else {
        fs.copy(folder.source, folder.destination);
    }
}

function createFolders (examplesFolder, structure) {
    _.each(structure, function (folder) {
        fs.mkdir(folder.destination).then(() => {
            copyFiles(folder);
        }).catch(err => console.error(err));
    });
}

function createBasicFolder (examplesFolder, portalFolder, structure) {
    fs.mkdir(examplesFolder).then(() => {
        fs.mkdir(portalFolder).then(() => {
            createFolders(examplesFolder, structure);
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
}

function removeExampleFolders (examplesFolder, portalFolder, structure) {
    fs.remove(examplesFolder).then(() => {
        createBasicFolder(examplesFolder, portalFolder, structure);
    }).catch(err => console.error(err));
}

function createDataStructure () {
    var examplesFolder = "examples",
        portalFolder = examplesFolder + "/portal",
        structure = {
            lgvConfig: {
                source: "node_modules/lgv-config",
                destination: examplesFolder + "/lgv-config",
                files: [
                    "rest-services-internet.json",
                    "services-internet.json",
                    "style_v2.json"
                ]
            },
            images: {
                source: "img",
                destination: examplesFolder + "/img",
                files: ["ajax-loader.gif"]
            },
            portalFiles: {
                source: "./dist/Basic",
                destination: portalFolder + "/Basic",
                files: [
                    "config.js",
                    "config.json",
                    "index.html",
                    "css",
                    "js"
                ]
            }
        };

    removeExampleFolders(examplesFolder, portalFolder, structure);
}

console.warn("create structure for examples");
createDataStructure();