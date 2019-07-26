var replace = require("replace-in-file"),
    replacements = [];

module.exports = function (destination, stableVersion) {
    replacements = [];

    replacements.push({
        "files": destination + "/index.html",
        "from": /\/*(\.+\/)*img\/ajax-loader\.gif/g,
        "to": "../Mastercode/" + stableVersion + "/img/ajax-loader.gif"
    });
    replacements.push({
        "files": destination + "/index.html",
        "from": /\/*(\.+\/)*build\/css\/style\.css/g,
        "to": "../Mastercode/" + stableVersion + "/css/style.css"
    });
    replacements.push({
        "files": destination + "/index.html",
        "from": /\/*(\.+\/)*build\/js\/masterportal\.js/g,
        "to": "./js/masterportal.js"
    });

    replacements.forEach(function (replacement) {
        replace.sync({
            files: replacement.files,
            from: replacement.from,
            to: replacement.to
        });
    });

};
