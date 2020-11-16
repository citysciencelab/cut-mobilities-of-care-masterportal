/**
 * Checks if the passed parameter is an object.
 * @param {*} value - paramter to check
 * @returns {Boolean} true if value is an ojbect ohterwise false
 */
export default function isObject (value) {
    return Object.prototype.toString.call(value) === "[object Object]";
}
