const fs = require("fs-extra"),
    inquirer = require("inquirer"),
    build = require("./build");


function copyFiles (source) {

}

function removeFiles (destination) {
    fs.remove(destination).then(() => {
        console.warn("Successfully deleted '" + destination + "' directory");
    });
}

function buildExamples () {
    var answers = {
            portalPath: "portal/basic",
            portalName: "Basic",
            environment: "Internet"
        },
        destinationFile = "examples";

    build.buildWebpack(answers);
    removeFiles(destinationFile);
    copyFiles("/dist" + answers.portalName, destinationFile);


}

inquirer.prompt().then(function (answers) {
    buildExamples(answers);
});