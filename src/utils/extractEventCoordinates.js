/**
 * Help function for determining a feature with textual description.
 * @param {Object} eventCoordinates The array containing the coordinates.
 * @returns {String[]} Returns an array with coordinates.
 */
function extractEventCoordinates (eventCoordinates) {
    let coordinates;

    if (eventCoordinates !== undefined && Array.isArray(eventCoordinates)) {
        coordinates = eventCoordinates;
    }
    else if (eventCoordinates !== undefined && !Array.isArray(eventCoordinates)) {
        coordinates = eventCoordinates.split(" ");
    }

    return coordinates;
}

export {extractEventCoordinates};
