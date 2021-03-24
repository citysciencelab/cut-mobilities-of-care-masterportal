import {getArea, getLength} from "ol/sphere";

/**
 * Calculates lengths and deviations of a line array.
 * @param {String} projection EPSG projection code
 * @param {module:ol/geom/LineString[]} lines lines to calculate length of
 * @param {Number} radius earth radius to assume for calculation
 * @param {Number} selectedUnit index of unit
 * @return {MeasureCalculation[]} calculated value for display, if value is 0, return without unit
 */
export function calculateLineLengths (projection, lines, radius, selectedUnit) {
    return Object.keys(lines).reduce((accumulator, lineKey) => {
        const line = lines[lineKey],
            length = getLength(line.getGeometry(), {projection, radius});

        if (length.toFixed(0) === "0") {
            accumulator[lineKey] = "0";
        }
        else {
            accumulator[lineKey] = selectedUnit === "1"
                ? `${(length / 1000).toFixed(1)} km`
                : `${length.toFixed(0)} m`;
        }

        return accumulator;
    }, {});
}

/**
 * Calculates lengths and deviations of a line array.
 * @param {String} projection EPSG projection code
 * @param {module:ol/geom/Polygon[]} polygons polygons to area of
 * @param {Number} radius earth radius to assume for calculation
 * @param {Number} selectedUnit index of unit
 * @return {MeasureCalculation[]} calculated value for display, if value is 0, return without unit
 */
export function calculatePolygonAreas (projection, polygons, radius, selectedUnit) {
    return Object.keys(polygons).reduce((accumulator, polygonKey) => {
        const polygon = polygons[polygonKey],
            area = getArea(polygon.getGeometry(), {projection, radius});

        if (area.toFixed(0) === "0") {
            accumulator[polygonKey] = "0";
        }
        else {
            accumulator[polygonKey] = selectedUnit === "1"
                ? `${(area / 1000000).toFixed(1)} km²`
                : `${area.toFixed(0)} m²`;
        }

        return accumulator;
    }, {});
}
