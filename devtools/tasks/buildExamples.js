const fs = require("fs-extra"),
    inquirer = require("inquirer"),
    buildFunctions = require("./buildFunctions"),
    questions = [
        {type: "input", name: "portalPath", message: "Bitte Pfad zum Portal angeben:", default: "portal/basic"}
    ];


function copyFiles (source, destination) {
    console.warn("copyFiles");
    fs.copy(source, destination);
}

function removeFiles (answers, destination) {
    var source = "/dist" + answers.portalName;

    console.warn("removeFiles");
    fs.remove(destination).then(() => {
        console.warn("Successfully deleted '" + destination + "' directory");
        copyFiles(source, destination);
    });
}

function buildExamples (answers) {
    var answers1 = {
            portalPath: "portal/basic",
            portalName: "Basic",
            environment: "Internet",
            customModule: ""
        },
        destination = "examples";

    buildFunctions(answers1).then(() => {
        console.warn("build is finished!!!");
        removeFiles(answers1, destination);
    });
}

inquirer.prompt(questions).then(function (answers) {
    buildExamples(answers);
});