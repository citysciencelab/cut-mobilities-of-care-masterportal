
/**
 * Returns a copy of the object, filtered to omit the keys specified
 * (or array of blacklisted keys).
 * @param {Object} object - The object.
 * @param {Number[]|String[]|Boolean[]} blacklist - Blacklisted keys.
 * @param {Boolean} ignoreCase if true, case of keys are ignored
 * @returns {Object} - returns the entry/entries without the blacklisted key/keys.
 */
export function omit (object, blacklist, ignoreCase = false) {
    const keys = Object.keys(object ? object : {}),
        blacklistWithStrings = convertArrayElementsToString(blacklist, ignoreCase),
        filteredKeys = keys.filter(key => !blacklistWithStrings.includes(ignoreCase ? key.toUpperCase() : key)),
        filteredObj = filteredKeys.reduce((result, key) => {
            result[key] = object[key];
            return result;
        }, {});

    return filteredObj;
}

/**
 * Converts elements of an array to strings.
 * @param {Number[]|String[]|Boolean[]} [array=[]] - Array with elements.
 * @param  {Boolean} ignoreCase if true, case of elements are ignored
 * @returns {String[]} Array with elements as string.
 */
function convertArrayElementsToString (array = [], ignoreCase = false) {
    const arrayWithStrings = [];

    array.forEach(element => arrayWithStrings.push(ignoreCase ? String(element).toUpperCase() : String(element)));

    return arrayWithStrings;
}
