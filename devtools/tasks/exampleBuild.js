const buildFunctions = require("./buildFunctions");

console.warn("build Basic Portal");
buildFunctions({
    portalPath: "portal/basic",
    portalName: "Basic",
    environment: "Internet",
    customModule: ""
});