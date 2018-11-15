const fs = require("fs-extra"),
    _ = require("underscore"),
    exampleReplace = require("./exampleReplace"),
    packageJSON = require("../../package.json");

function createFolders (folder, name) {
    fs.mkdir(name).then(() => {
        if (_.has(folder, "subFolders")) {
            folder.subFolders.forEach(function (subFolder) {
                createFolders(subFolder, name + "/" + subFolder.name);
            });
        }
        if (_.has(folder, "files")) {
            folder.files.forEach(function (file) {
                fs.copy(folder.source + "/" + file, name + "/" + file)
                    .then(() => {
                        if (file === "config.js" || file === "config.json") {
                            exampleReplace(name + "/" + file);
                        }
                    })
                    .catch(err => console.error(err));
            });
        }
    });
}

function buildFolderStructure (structure) {
    structure.forEach(function (folder) {
        fs.remove(folder.name).then(() => {
            createFolders(folder, folder.name);
        }).catch(err => console.error(err));
    });
}

function createDataStructure () {
    var structure = [],
        folder = {
            name: "examples",
            subFolders: [
                {
                    name: "lgv-config",
                    subFolders: [
                        {
                            name: "img",
                            source: "node_modules/lgv-config/img",
                            files: [
                                "Icon-Badeseen.png",
                                "Icon-Schwimmbaeder.png",
                                "Icon-Spaß-am-Wasser.png",
                                "Krankenhaus.png"
                            ]
                        }
                    ],
                    source: "node_modules/lgv-config",
                    files: [
                        "rest-services-internet.json",
                        "services-internet.json",
                        "style_v2.json"
                    ]
                },
                {
                    name: "portal",
                    subFolders: [
                        {
                            name: "Basic",
                            source: "./dist/Basic",
                            files: [
                                "config.js",
                                "config.json",
                                "index.html",
                                "css",
                                "js"
                            ]
                        }
                    ]
                }
            ]
        },
        folderVersion = _.clone(folder),
        version = packageJSON.version;

    folderVersion.name = "examples-" + version;

    structure.push(folder);
    structure.push(folderVersion);

    buildFolderStructure(structure);
}

console.warn("create structure for examples");
createDataStructure();