var replace = require("replace-in-file");

module.exports = function (destination, stableVersion) {
    var replacement = {
        "files": destination,
        "from": /\/*(\.+\/)*build/g,
        "to": "../Mastercode/" + stableVersion
    };

    replace.sync(replacement);
};
