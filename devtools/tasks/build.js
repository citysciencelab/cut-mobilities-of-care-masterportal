const fs = require("fs-extra"),
    inquirer = require("inquirer"),
    replaceStrings = require("./replace"),
    execute = require("child-process-promise").exec,
    questions = [
        {type: "input", name: "portalPath", message: "Bitte Pfad zum Portal angeben:", default: "portal/basic"},
        {type: "input", name: "portalName", message: "Wie soll der Name des Ordners in dist lauten?", default: "Basic"},
        {type: "input", name: "environment", message: "'Internet' oder 'FHHnet'?", default: "Internet"},
        {type: "input", name: "customModule", message: "Bitte ggf. Name des custommodules im Ordner angeben:", default: ""}
    ];


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


function buildWebpack (answers) {
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

}

inquirer.prompt(questions).then(function (answers) {
    buildWebpack(answers);
});
