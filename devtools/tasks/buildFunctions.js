const fs = require("fs-extra"),
    execute = require("child-process-promise").exec;

/**
 * copy files to the given destination
 * @param {String} source source of the built portal
 * @param {String} destination destination folder for the built portal
 * @returns {void}
 */
function copyFiles (source, destination) {
    fs.copy(source, destination).then(() => {
<<<<<<< HEAD
        console.warn("NOTICE: Successfully Copied '" + source + "' to '" + destination + "' !");
        fs.copy("./dist/build", destination).then(() => {
            fs.remove("./dist/build").catch(err => console.error(err));
            console.warn("NOTICE: Successfully moved './dist/build' to '" + destination + "' !");
            replaceStrings(environment, destination);
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
=======
        console.warn("NOTE: Successfully Copied \"" + source + "\" to \"" + destination + "\".");
        fs.copy("./dist/build", destination).then(() => {
            fs.remove("./dist/build").catch(error => console.error(error));
            console.warn("NOTE: Successfully moved \"./dist/build\" to \"" + destination + "\".");
        }).catch(error => console.error(error));
    }).catch(error => console.error(error));
>>>>>>> refactor: step 1
}

/**
 * remove files if if they already exist.
 * @param {Object} answers contains the attributes for the portal to be build
 * @returns {void}
 */
function removeFiles (answers) {
    const portalName = answers.portalPath.split("/").pop(),
        destination = "dist/" + portalName,
        source = "./" + answers.portalPath;

    fs.remove(destination).then(() => {
<<<<<<< HEAD
        console.warn("NOTICE: Successfully deleted '" + destination + "' directory");
        copyFiles(source, destination, answers.environment);
=======
        console.warn("NOTE: Successfully deleted \"" + destination + "\" directory.");
        copyFiles(source, destination);
>>>>>>> refactor: step 1
    });
}

/**
 * start the process to build a portal with webpack
 * @param {Object} answers contains the attributes for the portal to be build
 * @returns {void}
 */
module.exports = function buildWebpack (answers) {
    let command;

    if (answers.customModule !== "") {
        command = "webpack --config devtools/webpack.prod.js --CUSTOMMODULE ../" + answers.portalPath + "/" + answers.customModule;
    }
    else {
        command = "webpack --config devtools/webpack.prod.js";
    }
    console.warn("NOTICE: webpack startet...");
    console.log("NOTICE: executing command " + command);

    execute(command)
        .then(function (result) {
            console.warn(result.stdout);
            removeFiles(answers);
        })
        .catch(function (err) {
            console.error("ERROR: ", err);
        });
};
