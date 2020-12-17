import stateMeasure from "./stateMeasure";
import {calculateLinesLength, calculatePolygonsArea} from "../measureCalculation";

import {MapMode} from "../../../map/store/enums";
import {generateSimpleGetters} from "../../../../app-store/utils/generators";

/**
 * @typedef {Object} MeasureCalculation
 * @property {String} deviance estimation of scale-related error
 * @property {String} measure length or area of geometry
 */

// TODO source.clear on mode change
// TODO when 3D changes, re-do interaction

const getters = {
    ...generateSimpleGetters(stateMeasure),
    is3D (_, __, ___, rootGetters) {
        return rootGetters["Map/mapMode"] === MapMode.MODE_3D;
    },
    geometryValues (state, {is3D}) {
        return is3D
            ? state.geometryValues3d
            : state.geometryValues;
    },
    selectedGeometry (state, {is3D}) {
        return is3D
            ? state.geometryValues3d[0]
            : state.selectedGeometry;
    },
    currentUnits ({selectedGeometry, lineStringUnits, polygonUnits, geometryValues3d}, {is3D}) {
        if (is3D) {
            return geometryValues3d;
        }
        return selectedGeometry === "LineString"
            ? lineStringUnits
            : polygonUnits;
    },
    selectedUnit (state, {is3D}) {
        return is3D
            ? 0
            : state.selectedUnit;
    },
    /**
     * Calculates the length of lines.
     * @param {object} state measure store state
     * @param {object} getters measure store getters
     * @param {object} _ root state
     * @param {object} rootGetters root getters
     * @return {MeasureCalculation[]} calculated value for display
     */
    linesLength ({lines, earthRadius, lineStringUnits}, {selectedUnit}, _, rootGetters) {
        return calculateLinesLength(
            rootGetters["Map/scale"] / 1000,
            rootGetters["Map/projection"].getCode(),
            lineStringUnits[selectedUnit],
            lines,
            earthRadius,
            rootGetters.isTableStyle,
            selectedUnit
        );
    },
    /**
     * Calculates the area of a polygon.
     * @param {object} state measure store state
     * @param {object} getters measure store getters
     * @param {object} _ root state
     * @param {object} rootGetters root getters
     * @return {MeasureCalculation[]} calculated values for display, or false if none is available
     */
    polygonsArea ({polygons, earthRadius, polygonUnits}, {selectedUnit}, _, rootGetters) {
        return calculatePolygonsArea(
            rootGetters["Map/scale"] / 1000,
            rootGetters["Map/projection"].getCode(),
            polygonUnits[selectedUnit],
            polygons,
            earthRadius,
            rootGetters.isTableStyle,
            selectedUnit
        );
    }
};

export default getters;
