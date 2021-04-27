/**
 * Sorts an array of objects in the order of the nested attributes passed.
 * @param {Object[]} objects The objects to be sorted.
 * @param {String[]} nestedAttributes The nested attributes to be sorted by.
 * @returns {void}
 */
export function sortObjectsByNestedAttributes (objects, nestedAttributes) {
    const cloneObjects = [...objects];

    nestedAttributes.forEach(nestedAttribute => {
        sortObjects(cloneObjects, nestedAttribute);
    });

    return cloneObjects;
}

/**
 * Sorts objects by the passed nested attribute.
 * @param {Object[]} objects The objects to be sorted.
 * @param {String} nestedAttribute The nested attribute.
 * @returns {void}
 */
export function sortObjects (objects, nestedAttribute) {
    objects.sort((a, b) => {
        const firstElement = getNestedElement(a, nestedAttribute),
            secondElement = getNestedElement(b, nestedAttribute);

        if (firstElement < secondElement) {
            return -1;
        }
        else if (firstElement > secondElement) {
            return 1;
        }
        return 0;
    });
}


/**
 * Searches the object for a nested attribute and returns it as number or string.
 * @param {Object} searchElement The object that is to be searched.
 * @param {String} nestedAttribute The nested attribute.
 * @returns {Number|String} The element as number or string.
 */
export function getNestedElement (searchElement, nestedAttribute) {
    const path = nestedAttribute.split("."),
        nestedElement = path.reduce((object, field) => {
            if (object) {
                return object[field];
            }
            return "";

        }, searchElement);

    return isNaN(parseInt(nestedElement, 10)) ? nestedElement : parseInt(nestedElement, 10);
}

export default {sortObjectsByNestedAttributes, sortObjects, getNestedElement};
