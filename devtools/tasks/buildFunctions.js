const fs = require("fs-extra"),
    replaceStrings = require("./replace"),
    execute = require("child-process-promise").exec;

function copyFiles (source, destination, environment) {
    fs.copy(source, destination).then(() => {
        console.warn("Successfully Copied '" + source + "' to '" + destination + "' !");
        fs.copy("./dist/build", destination).then(() => {
            fs.remove("./dist/build").catch(err => console.error(err));
            console.warn("Successfully moved './dist/build' to '" + destination + "' !");
            replaceStrings(environment, destination);
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));
}

function removeFiles (answers) {
    var destination = "dist/" + answers.portalName,
        source = "./" + answers.portalPath;

    fs.remove(destination).then(() => {
        console.warn("Successfully deleted '" + destination + "' directory");
        copyFiles(source, destination, answers.environment);
    });
}


module.exports = function buildWebpack (answers) {
    var command;

    if (answers.customModule !== "") {
        command = "webpack --config devtools/webpack.prod.js --CUSTOMMODULE ../" + answers.portalPath + "/" + answers.customModule;
    }
    else {
        command = "webpack --config devtools/webpack.prod.js";
    }
    console.warn("webpack startet...");
    execute(command)
        .then(function (result) {
            console.warn(result.stdout);
            removeFiles(answers);
        })
        .catch(function (err) {
            console.error("ERROR: ", err);
        });
};