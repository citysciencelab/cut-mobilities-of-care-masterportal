/**
 * Gets nested values recursively from an object by the given key if it exists, up to a depth of 500.
 * @param {Object} obj - The object to search.
 * @param {String} searchKey - The key for the searched values.
 * @param {Object|String[]} [nestedValues=[]] - Given nested values.
 * @param {Number} [depth=0] - number of self calls
 * @param {Number} [maxDepth=500]  - maximum number of self calls
 * @returns {Object|String[]} results - The found nested values.
 */
export default function getNestedValues (obj, searchKey, nestedValues = [], depth = 0, maxDepth = 500) {
    const results = nestedValues;

    if (typeof obj !== "object" || obj === null || typeof searchKey !== "string") {
        console.error(`getNestedValues: ${obj} has to be defined and an object (not null). ${searchKey} has to be defined and a string`);
        return results;
    }

    Object.keys(obj).forEach(key => {
        const value = obj[key];

        if (key === searchKey) {
            results.push(value);
        }
        else if (typeof value === "object") {
            if (depth < maxDepth) {
                getNestedValues(value, searchKey, results, depth + 1);
            }
        }
    });

    return results;
}
