/**
 * uses the given geometryType to select the matching entry of drawTypeOptions
 * @param {String} geometryType the type of the geometry (e.g. "Point", "LineString", ...)
 * @param {Object[]} drawTypeOptions an array of object{geometry, ...} holding all possibilities
 * @returns {Object} the first drawTypeOption with a matching value for geometryType
 */
function getDrawTypeByGeometryType (geometryType, drawTypeOptions) {
    if (!Array.isArray(drawTypeOptions) || drawTypeOptions.length === 0) {
        return null;
    }

    for (let i = 0; i < drawTypeOptions.length; i++) {
        if (drawTypeOptions[i] === null || typeof drawTypeOptions[i] !== "object" || !drawTypeOptions[i].hasOwnProperty("geometry")) {
            continue;
        }
        else if (drawTypeOptions[i].geometry === geometryType) {
            return drawTypeOptions[i];
        }
        else if (drawTypeOptions[i].hasOwnProperty("altGeometry") && Array.isArray(drawTypeOptions[i].altGeometry)) {
            for (let n = 0; n < drawTypeOptions[i].altGeometry.length; n++) {
                if (drawTypeOptions[i].altGeometry[n] === geometryType) {
                    return drawTypeOptions[i];
                }
            }
        }
    }

    return drawTypeOptions[0];
}

export default getDrawTypeByGeometryType;
