var replace = require("replace-in-file"),
    replacements = [];

module.exports = function (destination, stableVersionNumber) {
    replacements = [];

    if (destination.match(/index\.html$/)) {
        replacements.push({
            "files": destination,
            "from": /\/*(\.+\/)*img\/ajax-loader\.gif/g,
            "to": "../Mastercode/" + stableVersionNumber + "/img/ajax-loader.gif"
        });
        replacements.push({
            "files": destination,
            "from": /\/*(\.+\/)*build\/css\/style\.css/g,
            "to": "../Mastercode/" + stableVersionNumber + "/css/style.css"
        });
        replacements.push({
            "files": destination,
            "from": /\/*(\.+\/)*build\/js\/masterportal\.js/g,
            "to": "../Mastercode/" + stableVersionNumber + "/js/masterportal.js"
        });
    }

    replacements.forEach(function (replacement) {
        replace.sync({
            files: replacement.files,
            from: replacement.from,
            to: replacement.to
        });
    });

};
