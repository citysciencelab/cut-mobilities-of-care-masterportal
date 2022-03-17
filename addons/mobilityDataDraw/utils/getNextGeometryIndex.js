/**
 * Returns the geometry index for the next mobility data feature
 *
 * @param {Array} mobilityData the current mobility data
 * @returns {Number} the geometry index for the new feature
 */
export default function getNextGeometryIndex (mobilityData) {
    if (!mobilityData.length) {
        return 0;
    }

    return Math.max(...mobilityData.map(data => data.geometryIndex)) + 1;
}
