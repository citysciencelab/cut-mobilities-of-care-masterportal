const replace = require("replace-in-file");
let replacements = [];

module.exports = function (destination, stableVersionNumber) {
    replacements = [];

    replacements.push({
        "files": destination + "/index.html",
        "from": /\/*(\.+\/)*img\/ajax-loader\.gif/g,
        "to": "../Mastercode/" + stableVersionNumber + "/img/ajax-loader.gif"
    });
    replacements.push({
        "files": destination + "/index.html",
        "from": /\/*(\.+\/)*build\/css\/style\.css/g,
        "to": "../Mastercode/" + stableVersionNumber + "/css/style.css"
    });
    replacements.push({
        "files": destination + "/index.html",
        "from": /\/*(\.+\/)*build\/js\/masterportal\.js/g,
        "to": "./js/masterportal.js"
    });
    replacements.push({
        "files": destination + "/js/masterportal.js",
        "from": /\/img\/tools\/draw\/circle_/g,
        "to": "/Mastercode/" + stableVersionNumber + "/img/tools/draw/circle_"
    });


    replacements.forEach(function (replacement) {
        replace.sync({
            files: replacement.files,
            from: replacement.from,
            to: replacement.to
        });
    });

};
