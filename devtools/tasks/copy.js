const fs = require("fs-extra"),
    inquirer = require("inquirer"),
    replaceStrings = require("./replace"),
    questions = [
        {type: "input", name: "portalPath", message: "Bitte Pfad zum Portal angeben:", default: "portal/basic"},
        {type: "input", name: "portalName", message: "Wie soll der Name des Ordners in dist heißen:", default: "Basic"},
        {type: "input", name: "environment", message: "'Internet' oder 'FHHnet'?:", default: "Internet"}
    ];


function copyFiles (source, destination, environment) {

    fs.copy(source, destination).then(() => {
        console.warn("Successfully Copied '" + source + "' to '" + destination + "' !");
        fs.move("./dist/build", destination, {overwrite: true}).then(() => {
            console.warn("Successfully moved './dist/build' to '" + destination + "' !");
            replaceStrings(environment, destination);
        }).catch(err => console.error(err));
    }).catch(err => console.error(err));

}

function doit (answers) {
    var destination = "dist/" + answers.portalName,
        source = "./" + answers.portalPath;

    fs.remove(destination).then(() => {
        console.warn("Successfully deleted '" + destination + "' directory");
        copyFiles(source, destination, answers.environment);
    });
}


inquirer.prompt(questions).then(function (answers) {
    doit(answers);
});
