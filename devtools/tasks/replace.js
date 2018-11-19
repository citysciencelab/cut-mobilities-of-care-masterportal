var replace = require("replace-in-file"),
    replacements = [];

module.exports = function (environment, destination) {
    replacements.push({
        "files": destination + "/index.html",
        "from": /..\/..\/build\//g,
        "to": "./"
    },
    {
        "files": destination + "/css/style.css",
        "from": /css\/woffs/g,
        "to": "./woffs"
    },
    {
        "files": destination + "/config.js",
        "from": /\/lgv-config/g,
        "to": "../lgv-config"
    },
    {
        "files": destination + "/config.json",
        "from": /\/lgv-config/g,
        "to": "../lgv-config"
    },
    {
        "files": destination + "/index.html",
        "from": /\/lgv-config/g,
        "to": "../lgv-config"
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

        if (rep.length > 0) {
            console.warn("Successfully replaced '" + replacement.from + "' in Files '" + replacement.files + "' to '" + replacement.to + "!");
        }
        else {
            console.warn("Could not replace '" + replacement.from + "' in Files '" + replacement.files + "' to '" + replacement.to + "!");
        }
    });
};
