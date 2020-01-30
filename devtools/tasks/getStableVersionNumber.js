const stableVersionRaw = require("../../package.json").version;

module.exports = function getStableVersionNumber (delimiter = "_") {
    return stableVersionRaw.replace(/\./g, delimiter);
};
