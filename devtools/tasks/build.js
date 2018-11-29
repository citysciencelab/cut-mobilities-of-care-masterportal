const inquirer = require("inquirer"),
    buildFunctions = require("./buildFunctions"),
    questions = [
        {type: "input", name: "portalPath", message: "Bitte Pfad zum Portal angeben:", default: "portal/basic"},
        {type: "input", name: "portalName", message: "Wie soll der Name des Ordners in dist lauten?", default: "Basic"},
        {type: "input", name: "environment", message: "'Internet' oder 'FHHnet'?", default: "Internet"},
        {type: "input", name: "customModule", message: "Bitte ggf. Name des custommodules im Ordner angeben:", default: ""}
    ];

inquirer.prompt(questions).then(function (answers) {
    buildFunctions(answers);
});
