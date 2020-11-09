/**
 * Gets nested values recursively from an object by the given key, if it exists.
 * @param {Object} obj - The object to search.
 * @param {String} searchKey - The key for the searched values.
 * @param {Object|String[]} nestedValues - Given nested values.
 * @returns {Object|String[]} results - The found nested values.
 */
export default function getNestedValues (obj, searchKey, nestedValues = []) {
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
            getNestedValues(value, searchKey, results);
        }
    });

    return results;
}
