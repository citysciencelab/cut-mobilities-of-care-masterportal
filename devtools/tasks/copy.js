const del = require("del"),
    copy = require("copy-concurrently"),
    inquirer = require("inquirer"),
    questions = [
        {type: "input", name: "portalPath", message: "Bitte Pfad zum Portal angeben:", default: "portal/basic"},
        {type: "input", name: "portalName", message: "Wie soll der Name des Ordners in dist heißen:", default: "Basic"}
    ];


function copyFiles (source, destination) {
    var copypathes = [];

    copypathes.push({src: source, dest: destination}, {src: "./dist/build", dest: destination});

    copypathes.forEach(function (path) {
        copy(path.src, path.dest).then(() => {
            console.log("Successfully Copied '" + path.src + "' to '" + path.dest + "' !");
        }).catch();
    });
}

function doit (answers) {
    var destination = "dist/" + answers.portalName,
        source = "./" + answers.portalPath;

    del([destination]).then(() => {
        console.log ("Successfully deleted '" + destination + "' directory");
        copyFiles(source, destination);
    });
}


inquirer.prompt(questions).then(function (answers) {
    doit(answers);
});
