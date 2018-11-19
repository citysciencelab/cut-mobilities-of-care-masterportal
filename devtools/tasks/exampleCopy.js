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
                        if (file === "config.js" || file === "config.json" || file === "index.html") {
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
                                "hh-logo.png",
                                "Icon-Badeseen.png",
                                "Icon-Schwimmbaeder.png",
                                "Icon-Spaß-am-Wasser.png",
                                "Krankenhaus.png",
                                "ajax-loader.gif",
                                "dira.png",
                                "bikeandride.png",
                                "grundschulen.png",
                                "gymnasien.png",
                                "stadtteilschulen.png",
                                "sonderschulen.png",
                                "berufliche_schulen.png",
                                "langformschulen.png",
                                "backgroundCanvas.jpeg",
                                "krippe.gif",
                                "krippe_ele_eh.gif",
                                "krippe_ele.gif",
                                "ele.gif",
                                "ele_eh.gif",
                                "krippe_ele_hort.gif",
                                "paemi.gif"
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

console.warn("create example folders, copy portal and dependencies");
createDataStructure();