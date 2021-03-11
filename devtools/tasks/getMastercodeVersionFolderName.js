const path = require("path"),
    rootPath = path.resolve(__dirname, "../../"),
    stableVersionNumber = require(path.resolve(rootPath, "devtools/tasks/getStableVersionNumber"))(),
    gitRevSync = require("git-rev-sync"),
    moment = require("moment"),
    date = moment().format("YYYY-MM-DD_HH-mm-ss");

module.exports = function getMastercodeVersionFolderName () {
    let folderName = stableVersionNumber;
    const tag = gitRevSync.tag().replace(/\./g, "_").slice(1),
        tagFirstParent = gitRevSync.tagFirstParent().replace(/\./g, "_").slice(1);

    if (stableVersionNumber !== tag || stableVersionNumber !== tagFirstParent) {
        folderName += `_${gitRevSync.branch()}_${date}`;
    }

    return folderName;
};
