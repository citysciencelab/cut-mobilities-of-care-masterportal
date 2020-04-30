const fs = require("fs-extra"),
    path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))();

module.exports = function prependVersionAndTime (filepath) {
    const jsContent = fs.readFileSync(filepath),
        fd = fs.openSync(filepath, "w+"),
        dt = new Date();

    let currentFormattedDt = "",
        contentToPrepend = "";

    currentFormattedDt = dt.getFullYear() + "-" + (dt.getMonth() + 1) + "-" + dt.getDate();
    contentToPrepend = "/*v" + stableVersionNumber + ",built@" + currentFormattedDt + "*/";

    fs.writeSync(fd, contentToPrepend + jsContent, {mode: 438, flags: "w"});
    fs.close(fd, (error) => {
        if (error) {
            throw error;
        }
    });
};
