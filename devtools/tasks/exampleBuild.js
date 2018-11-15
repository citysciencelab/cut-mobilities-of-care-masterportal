const buildFunctions = require("./buildFunctions");

console.warn("build Basic Portal for examples");
buildFunctions({
    portalPath: "portal/basic",
    portalName: "Basic",
    environment: "Internet",
    customModule: ""
});