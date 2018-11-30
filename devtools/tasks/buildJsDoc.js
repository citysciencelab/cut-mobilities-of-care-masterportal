const execute = require("child-process-promise").exec,
    path = require("path"),
    pathToJsDocCmd = path.resolve(__dirname, "../../node_modules/.bin/jsdoc");

/**
 * Removes Folder jsdoc recusively if existent.
 * Then it generates the JsDoc using:
 * Config: -c jsdoc-config.json
 * Destination: -d
 * Recursion: -r
 */
execute("rm -rf jsdoc")
    .then(function () {
        execute(pathToJsDocCmd + " -c jsdoc-config.json");
    });
