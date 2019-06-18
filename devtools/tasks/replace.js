var replace = require("replace-in-file"),
    sourceFile = require("../../package.json"),
    replacements = [];

module.exports = function (environment, destination, deepness = 2) {
    var lgvConfigRegex = /\/*(\.+\/)*lgv-config/g,
        lgvConfigReplacement = "lgv-config";

    while (deepness--) {
        lgvConfigReplacement = "../"+lgvConfigReplacement;
    }

    ["index.html", "css/style.css", "config.js", "config.json"].forEach((file) => {
        replacements.push({
            "files": destination+"/"+file,
            "from": lgvConfigRegex,
            "to": lgvConfigReplacement
        });
    });
    replacements.push(
    {
        "files": destination + "/index.html",
        "from": /\/*(\.+\/)*build/g,
        "to": "."
    },
    {
        "files": destination + "/css/style.css",
        "from": /css\/woffs/g,
        "to": "./woffs"
    },
    {
        "files": destination + "/config.js",
        "from": "$Version",
        "to": sourceFile.version
    });

    if (environment === "Internet") {
        replacements.push({
            "files": destination + "/config.js",
            "from": /rest-services-fhhnet/g,
            "to": "rest-services-internet"
        },
        {
            "files": destination + "/config.js",
            "from": /services-fhhnet-ALL/g,
            "to": "services-internet"
        },
        {
            "files": destination + "/config.js",
            "from": /services-fhhnet/g,
            "to": "services-internet"
        });
    }
    else {
        replacements.push({
            "files": destination + "/config.js",
            "from": /rest-services-internet/g,
            "to": "rest-services-fhhnet"
        },
        {
            "files": destination + "/config.js",
            "from": /services-internet/g,
            "to": "services-fhhnet"
        });
    }
    replacements.forEach(function (replacement) {
        var rep = replace.sync({
            files: replacement.files,
            from: replacement.from,
            to: replacement.to
        });
    });
};
