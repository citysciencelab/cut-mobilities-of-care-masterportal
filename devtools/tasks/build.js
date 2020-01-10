const inquirer = require("inquirer"),
    buildFunctions = require("./buildFunctions"),
    questions = [
        {
            type: "input",
            name: "portalPath",
            message: "Pfad zum Ordner mit Portalen ausgehend von \"[...]/masterportal/\":",
            default: "portal"
        }
    ];

inquirer.prompt(questions).then(function (answers) {
    buildFunctions(answers);
});
