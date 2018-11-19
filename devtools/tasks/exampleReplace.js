var replace = require("replace-in-file");

module.exports = function (destination) {
    var replacement = {
            "files": destination,
            "from": /\..\/lgv-config/g,
            "to": "../../lgv-config"
        },
        rep = replace.sync(replacement);

    if (rep.length > 0) {
        console.warn("Successfully replaced '" + replacement.from + "' in Files '" + replacement.files + "' to '" + replacement.to + "!");
    }
    else {
        console.warn("Could not replace '" + replacement.from + "' in Files '" + replacement.files + "' to '" + replacement.to + "!");
    }
};
