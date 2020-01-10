const replace = require("replace-in-file"),
    path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))();

module.exports = function (destination) {
    const replacements = [
        {
            "files": destination + "/index.html",
            "from": /\/*(\.+\/)*img\/ajax-loader\.gif/g,
            "to": "../mastercode/" + stableVersionNumber + "/img/ajax-loader.gif"
        },
        {
            "files": destination + "/index.html",
            "from": /\/*(\.+\/)*build/g,
            "to": "../mastercode/" + stableVersionNumber
        },
        {
            "files": destination + "/css/style.css",
            "from": /css\/woffs/g,
            "to": "./woffs"
        },
        {
            "files": destination + "/css/style.css",
            "from": /url\s?\(\s?"\/img\//g,
            "to": "url(\"../img/"
        },
        {
            "files": destination + "/css/style.css",
            "from": /url\s?\(\s?'\/img\//g,
            "to": "url('../img/"
        },
        {
            "files": destination + "/css/style.css",
            "from": /url\s?\(\s?\/img\//g,
            "to": "url(../img/"
        }
    ];

    replacements.forEach(function (replacement) {
        replace.sync({
            files: replacement.files,
            from: replacement.from,
            to: replacement.to
        });
    });
};
