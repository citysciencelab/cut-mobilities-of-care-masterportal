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

function createFolders (structure) {
    _.each(structure, function (folder) {
        fs.mkdir(folder.destination).then(() => {
            copyFiles(folder);
        }).catch(err => console.error(err));
    });
}

function removeExampleFolders (examplesFolder, structure) {
    fs.remove(examplesFolder).then(() => {
        createFolders(structure);
    }).catch(err => console.error(err));
}

function createDataStructure () {
    var examplesFolder = "examples",
        structure = {
            examplesPortal: {
                source: "./dist/Basic",
                destination: examplesFolder,
                files: [
                    "css",
                    "js"
                ]
            },
            portal: {
                source: "",
                destination: examplesFolder + "/portal"
            },
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
                source: "node_modules/lgv-config/img",
                destination: examplesFolder + "/img",
                files: []
            },
            portalFiles: {
                source: "./dist/Basic",
                destination: examplesFolder + "/portal/Basic",
                files: [
                    "config.js",
                    "config.json",
                    "index.html"
                ]
            }
        };

    removeExampleFolders(examplesFolder, structure);
}

console.warn("create structure for examples");
createDataStructure();