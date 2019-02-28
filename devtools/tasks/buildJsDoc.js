const execute = require("child-process-promise").exec,
    path = require("path"),
    pathToJsDocCmd = path.resolve(__dirname, "../../node_modules/.bin/jsdoc");

/**
 * Removes folder jsdoc if it exists.
 * rd remove directory
 * /s with all subfolders
 * /q without confirmations
 * Then it generates the JsDoc using:
 * Config: -c jsdoc-config.json
 */

execute("if exist jsdoc rd /s /q jsdoc")
    .then(function () {
        execute(pathToJsDocCmd + " -c ./devtools/jsdoc/jsdoc-config.json");
    });
