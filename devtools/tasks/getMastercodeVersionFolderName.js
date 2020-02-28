const path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))(),
    gitRevSync = require("git-rev-sync"),
    moment = require("moment");

module.exports = function getMastercodeVersionFolderName () {
    let folderName = stableVersionNumber;

    if (gitRevSync.branch().toUpperCase() !== "STABLE") {
        folderName += "_DEV_" + moment(gitRevSync.date()).format("YYYY-MM-DD__HH-mm-ss");
    }

    return folderName;
};
