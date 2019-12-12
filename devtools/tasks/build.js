const inquirer = require("inquirer"),
    buildFunctions = require("./buildFunctions"),
    questions = [
        {
            type: "input",
            name: "portalPath",
            message: "Pfad zum Portal ausgehend von \"[...]/masterportal/\":",
            default: "portal/basic"
        }
    ];

inquirer.prompt(questions).then(function (answers) {
    buildFunctions(answers);
});
