const fs = require("fs-extra"),
    stableVersion = require("../../package.json").version.replace(/\./g, "_");

module.exports = function prependVersionAndTime (path) {
    var
        jsContent = fs.readFileSync(path),
        fd = fs.openSync(path, "w+"),
        dt = new Date(),
        currentFormattedDt,
        masterPortalBuildVersion = stableVersion.replace(/_/g, "."),
        contentToPrepend;

    currentFormattedDt = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
    contentToPrepend = "/*v" + masterPortalBuildVersion + ",built@" + currentFormattedDt + "*/";

    fs.writeSync(fd, contentToPrepend + jsContent, {mode: 438, flags: "w"});
    fs.close(fd, (error) => {
        if (error) {
            throw error;
        }
    });
};
