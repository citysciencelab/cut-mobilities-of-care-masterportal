/**
 * Help function for determining a feature with textual description.
 * @param {Object} coordinateArray The array containing the coordinates.
 * @returns {String[]} Returns an array with coordinates.
 */
function extractEventCoordinates (coordinateArray) {
    let coordinates;

    if (coordinateArray !== undefined && Array.isArray(coordinateArray)) {
        coordinates = coordinateArray;
    }
    else if (coordinateArray !== undefined && !Array.isArray(coordinateArray)) {
        coordinates = coordinateArray.split(" ");
    }

    return coordinates;
}

export {extractEventCoordinates};
