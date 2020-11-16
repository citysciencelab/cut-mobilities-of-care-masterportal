/**
 * Uppercases the first letter of a given string.
 * @param {String} value A string to uppercase the first letter.
 * @returns {String} The same string, but with uppercased first letter.
 */
export default function upperFirst (value) {
    if (typeof value !== "string") {
        return "";
    }

    return value.charAt(0).toUpperCase() + value.substring(1);
}
