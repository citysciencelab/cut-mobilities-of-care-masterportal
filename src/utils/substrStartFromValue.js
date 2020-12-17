/**
 * Returns a string starting from the given value if it exists.
 * Otherwise do nothing.
 * @param {String} str - the origin string
 * @param {String} value - value for the start index
 * @returns {String|Boolean} substring, origin string or false if any invalid param was given
 */
export default function substrStartFromValue (str, value) {
    if (typeof str !== "string" || typeof value !== "string") {
        console.error(`substrStartFromValue: ${str} and ${value} have to be defined and a string`);
        return false;
    }
    const indexOf = str.indexOf(value);

    if (indexOf !== -1) {
        return str.substr(indexOf + value.length);
    }
    console.warn(`substrStartFromValue: ${value} not found in the origin string '${str}'`);
    return str;
}
