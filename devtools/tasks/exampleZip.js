const zipAFolder = require("zip-a-folder"),
    packageJSON = require("../../package.json");

zipAFolder.zip("examples", "examples.zip");
zipAFolder.zip("examples-" + packageJSON.version, "examples-" + packageJSON.version + ".zip");