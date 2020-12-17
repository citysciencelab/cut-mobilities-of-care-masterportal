import {getArea, getLength} from "ol/sphere";

/**
 * Calculates the square of x and y deltas of two coordinates.
 * @param {Number[]} coordinateA first coordinate
 * @param {Number[]} coordinateB second coordinate
 * @return {undefined}
 */
export function calculateDeltaPow (coordinateA, coordinateB) {
    const dx = coordinateA[0] - coordinateB[0],
        dy = coordinateA[1] - coordinateB[1];

    return Math.pow(dx, 2) + Math.pow(dy, 2);
}

/**
 * Calculates lengths and deviations of a line array.
 * @param {Number} scaleError used to calculate the scale-related error with standard deviation 1mm
 * @param {String} projection EPSG projection code
 * @param {String} unit to use for printing
 * @param {module:ol/geom/LineString[]} lines lines to calculate length of
 * @param {Number} radius earth radius to assume for calculation
 * @param {Boolean} isTableStyle whether Masterportal is in table style
 * @param {Number} selectedUnit index of unit
 * @return {MeasureCalculation[]} calculated value for display
 */
export function calculateLinesLength (scaleError, projection, unit, lines, radius, isTableStyle, selectedUnit) {
    const calculatedLengths = {};

    Object.keys(lines).forEach(lineKey => {
        const line = lines[lineKey],
            coords = line.getGeometry().getCoordinates(),
            error = Math.sqrt((coords.length - 1) * Math.pow(scaleError, 2)),
            length = getLength(line.getGeometry(), {projection, radius});

        if (isTableStyle) {
            calculatedLengths[lineKey] = {
                measure: selectedUnit === "1"
                    ? `${(length / 1000).toFixed(1)} ${unit}`
                    : `${length.toFixed(0)} ${unit}`,
                deviance: "modules.tools.measure.finishInteraction"
            };
        }
        else {
            calculatedLengths[lineKey] = {
                measure: selectedUnit === "1"
                    ? `${(length / 1000).toFixed(3)} ${unit}`
                    : `${length.toFixed(2)} ${unit}`,
                deviance: `(+/- ${selectedUnit === "1"
                    ? (error / 1000).toFixed(3)
                    : error.toFixed(2)} ${unit})`
            };
        }
    });

    return calculatedLengths;
}

/**
 * Calculates lengths and deviations of a line array.
 * @param {Number} scaleError used to calculate the scale-related error with standard deviation 1mm
 * @param {String} projection EPSG projection code
 * @param {String} unit to use for printing
 * @param {module:ol/geom/Polygon[]} polygons polygons to area of
 * @param {Number} radius earth radius to assume for calculation
 * @param {Boolean} isTableStyle whether Masterportal is in table style
 * @param {Number} selectedUnit index of unit
 * @return {MeasureCalculation[]} calculated value for display
 */
export function calculatePolygonsArea (scaleError, projection, unit, polygons, radius, isTableStyle, selectedUnit) {
    const calculatedAreas = {};

    Object.keys(polygons).forEach(polygonKey => {
        const polygon = polygons[polygonKey],
            coords = polygon.getGeometry().getLinearRing(0).getCoordinates(),
            area = getArea(polygon.getGeometry(), {projection, radius});
        let error = 0;

        coords.forEach((_, i) => {
            error += calculateDeltaPow(coords[i], coords[(i + 1) % coords.length]);
        });

        error = 0.5 * scaleError * Math.sqrt(error);

        if (isTableStyle) {
            calculatedAreas[polygonKey] = {
                measure: selectedUnit === "1"
                    ? `${(area / 1000000).toFixed(1)} ${unit}`
                    : `${area.toFixed(0)} ${unit}`,
                deviance: "modules.tools.measure.finishInteraction"
            };
        }
        else {
            calculatedAreas[polygonKey] = {
                measure: selectedUnit === "1"
                    ? `${(area / 1000000).toFixed(2)} ${unit}`
                    : `${area.toFixed(0)} ${unit}`,
                deviance: selectedUnit === "1"
                    ? `(+/- ${(error / 1000000).toFixed(2)} ${unit})`
                    : `(+/- ${error.toFixed(0)} ${unit})`
            };
        }
    });

    return calculatedAreas;
}
