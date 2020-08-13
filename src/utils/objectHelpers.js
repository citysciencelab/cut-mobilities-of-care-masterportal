
/**
 * Returns a copy of the object, filtered to omit the keys specified
 * (or array of blacklisted keys).
 * @param {Object} object - The object.
 * @param {Number[]|String[]|Boolean[]} blacklist - Blacklisted keys.
 * @returns {Object} - returns the entry/entries without the blacklisted key/keys.
 */
export function omit (object, blacklist) {
    const keys = Object.keys(object ? object : {}),
        blacklistWithStrings = convertArrayElementsToString(blacklist),
        filteredKeys = keys.filter(key => !blacklistWithStrings.includes(key.toUpperCase())),
        filteredObj = filteredKeys.reduce((result, key) => {
            result[key] = object[key];
            return result;
        }, {});

    return filteredObj;
}

/**
 * Converts elements of an array to strings.
 * @param {Number[]|String[]|Boolean[]} [array=[]] - Array with elements.
 * @returns {String[]} Array with elements as string.
 */
function convertArrayElementsToString (array = []) {
    const arrayWithStrings = [];

    array.forEach(element => arrayWithStrings.push(String(element)));

    return arrayWithStrings;
}
