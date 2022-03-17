/**
 * Returns the file extension for the given file
 *
 * @param {File} file the file to return the extension for
 * @returns {String} the file extension
 */
export default function getFileExtension (file) {
    const extensionMatch = file.name.match(/\.(?<extension>\w+$)/),
        fileExtension = extensionMatch && extensionMatch.groups.extension;

    if (!fileExtension) {
        throw Error("Couldn't find file extension in file name.");
    }

    return fileExtension;
}
