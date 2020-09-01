/**
 * Transforms the given value to null, if it is not a number.
 *
 * @param {*} value value to check whether its a number.
 * @returns {Number|null} Returns null, if the input value is not a number.
 */
export function transformNaNToNull (value) {
    return isNaN(value) ? null : value;
}
