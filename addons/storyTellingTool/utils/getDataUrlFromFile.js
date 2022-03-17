/**
 * Converts a file to base64 string and returns it
 *
 * @param {File} file the file to return the data url for
 * @returns {String} the data url
 */
export default function getDataUrlFromFile (file) {
    return new Promise(resolve => {
        const reader = new FileReader();

        reader.addEventListener(
            "load",
            () => {
                resolve(reader.result);
            },
            false
        );
        // Convert file to base64 string
        reader.readAsDataURL(file);
    });
}
