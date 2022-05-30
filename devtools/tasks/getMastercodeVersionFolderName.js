const path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))(),
    gitRevSync = require("git-rev-sync"),
    moment = require("moment");

module.exports = function getMastercodeVersionFolderName () {
    let folderName = stableVersionNumber;

    return folderName;
};
