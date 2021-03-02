const path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))(),
    gitRevSync = require("git-rev-sync"),
    moment = require("moment");

module.exports = function getMastercodeVersionFolderName () {
    let folderName = stableVersionNumber;
    const tag = gitRevSync.tag().replace(/\./g, "_"),
        tagFirstParent = gitRevSync.tagFirstParent().replace(/\./g, "_");

    if (stableVersionNumber !== tag || stableVersionNumber !== tagFirstParent) {
        folderName += `_${gitRevSync.branch()}_${moment().format("YYYY-MM-DD_HH-mm-ss")}`;
    }

    return folderName;
};
