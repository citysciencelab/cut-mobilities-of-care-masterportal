const path = require("path"),
    fs = require("fs"),
    ext_file_list = recFindByExt("./", "js");

/**
 * Finds and lists all files with a specific suffix
 * @param {String} base - Base path
 * @param {String} ext - Suffix
 * @param {Array} files - Array of files to search
 * @param {Array} result - Array of files found
 * @returns {Array} Array of files found
 */
function recFindByExt (base, ext, files, result) {
    const files2 = files || fs.readdirSync(base);
    let result2 = result || [];

    files2.forEach(file => {
        const newbase = path.join(base, file);

        if (file === "node_modules") {
            return;
        }
        if (fs.statSync(newbase).isDirectory()) {
            result2 = recFindByExt(newbase, ext, fs.readdirSync(newbase), result2);
        }
        else if (file.substr(-1 * (ext.length + 1)) === "." + ext) {
            result2.push(newbase);
        }
    });
    return result2;
}

ext_file_list.forEach(filename => {
    fs.readFile(filename, "utf-8", (err, rawText) => {
        const matches = rawText.match(/import ([A-Z][^\s]*)/g);

        if (err) {
            throw err;
        }

        if (!matches) {
            return;
        }

        matches.forEach(singleMatch => {
            const refinedMatch = singleMatch.replace("import ", ""),
                rgxp1 = new RegExp("new " + refinedMatch, "g"),
                rgxp2 = new RegExp(refinedMatch + "\\.prototype", "g"),
                rgxp3 = new RegExp(refinedMatch + "\\.extend", "g"),
                findings1 = rawText.match(rgxp1),
                findings2 = rawText.match(rgxp2),
                findings3 = rawText.match(rgxp3);

            if (!findings1 && !findings2 && !findings3) {
                console.warn(filename + ": " + refinedMatch);
            }
        });
    });
});
