const replace = require("replace-in-file"),
    path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),
    mastercodeVersionFolderName = require(path.resolve(rootPath, "devtools/tasks/getMastercodeVersionFolderName"))();


module.exports = function (destination) {
    const replacements = [
        {
            "files": destination + "/index.html",
            "from": /\/*(\.+\/)*img\/ajax-loader\.gif/g,
            "to": "../mastercode/" + mastercodeVersionFolderName + "/img/ajax-loader.gif"
        },
        {
            "files": destination + "/index.html",
            "from": /\/*(\.+\/)*build/g,
            "to": "../mastercode/" + mastercodeVersionFolderName
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
        },
        {
            "files": destination + "/" + "masterportal.js",
            "from": /\/locales\/\{\{lng\}\}\/\{\{ns\}\}\.json/g,
            "to": "./../mastercode/" + mastercodeVersionFolderName + "/locales/{{lng}}/{{ns}}.json"
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
