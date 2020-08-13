/**
 * Uppercases the first letter of a given string.
 * @param {string} string to uppercase
 * @returns {string} uppercased string
 */
export function upperFirst (string) {
    return string ? string.charAt(0).toUpperCase() + string.slice(1) : "";
}
