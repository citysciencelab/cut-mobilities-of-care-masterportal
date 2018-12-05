var replace = require("replace-in-file");

module.exports = function (destination, mainFolder, stableVersion) {
    var replacements = [{
        "files": destination,
        "from": /\/lgv-config/g,
        "to": "../../lgv-config"
    },
    {
        "files": destination,
        "from": /..\/..\/build\//g,
        "to": "../" + mainFolder + "/" + stableVersion + "/"
    }];

    replacements.forEach(function (replacement) {
        replace.sync(replacement);
    });
};
