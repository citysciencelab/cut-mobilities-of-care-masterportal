const zipAFolder = require("zip-a-folder"),
    packageJSON = require("../../package.json");

console.warn("start zipping");
zipAFolder.zip("examples", "examples.zip");
zipAFolder.zip("examples-" + packageJSON.version, "examples-" + packageJSON.version + ".zip");
console.warn("complete zipping");