import {getArea, getLength} from "ol/sphere";

/**
 * Calculates lengths and deviations of a line array.
 * @param {String} projection EPSG projection code
 * @param {module:ol/geom/LineString[]} lines lines to calculate length of
 * @param {Number} radius earth radius to assume for calculation
 * @param {String} unit to use for printing
 * @param {Number} selectedUnit index of unit
 * @return {MeasureCalculation[]} calculated value for display
 */
export function calculateLinesLength (projection, lines, radius, unit, selectedUnit) {
    return Object.keys(lines).reduce((accumulator, lineKey) => {
        const line = lines[lineKey],
            length = getLength(line.getGeometry(), {projection, radius});

        accumulator[lineKey] = selectedUnit === "1"
            ? `${(length / 1000).toFixed(1)} ${unit}`
            : `${length.toFixed(0)} ${unit}`;

        return accumulator;
    }, {});
}

/**
 * Calculates lengths and deviations of a line array.
 * @param {String} projection EPSG projection code
 * @param {module:ol/geom/Polygon[]} polygons polygons to area of
 * @param {Number} radius earth radius to assume for calculation
 * @param {String} unit to use for printing
 * @param {Number} selectedUnit index of unit
 * @return {MeasureCalculation[]} calculated value for display
 */
export function calculatePolygonsArea (projection, polygons, radius, unit, selectedUnit) {
    return Object.keys(polygons).reduce((accumulator, polygonKey) => {
        const polygon = polygons[polygonKey],
            area = getArea(polygon.getGeometry(), {projection, radius});

        accumulator[polygonKey] = selectedUnit === "1"
            ? `${(area / 1000000).toFixed(1)} ${unit}`
            : `${area.toFixed(0)} ${unit}`;

        return accumulator;
    }, {});
}
