import stateMeasure from "./stateMeasure";
import {calculateLinesLength, calculatePolygonsArea} from "../measureCalculation";

import {MapMode} from "../../../map/store/enums";
import {generateSimpleGetters} from "../../../../app-store/utils/generators";

const getters = {
    ...generateSimpleGetters(stateMeasure),
    /**
     * @param {object} _ measure store state
     * @param {object} __ measure store getters
     * @param {object} ___ root state
     * @param {object} rootGetters root getters
     * @return {boolean} whether the portal is currently in 3D mode
     */
    is3d (_, __, ___, rootGetters) {
        return rootGetters["Map/mapMode"] === MapMode.MODE_3D;
    },
    /**
     * @param {object} state measure store state
     * @param {object} getters measure store getters
     * @returns {String[]} options for geometry selection
     */
    geometryValues ({geometryValues3d, geometryValues}, {is3d}) {
        return is3d
            ? geometryValues3d
            : geometryValues;
    },
    /**
     * @param {object} state measure store state
     * @param {object} getters measure store getters
     * @returns {String} selected geometry selection option
     */
    selectedGeometry ({geometryValues3d, selectedGeometry}, {is3d}) {
        return is3d
            ? geometryValues3d[0] // 3D mode only has one option
            : selectedGeometry;
    },
    /**
     * @param {String} state measure store state
     * @param {object} getters measure store getters
     * @returns {String[]} options for measurement units
     */
    currentUnits ({selectedGeometry, lineStringUnits, polygonUnits}, {is3d}) {
        if (is3d) {
            return lineStringUnits;
        }

        return selectedGeometry === "LineString"
            ? lineStringUnits
            : polygonUnits;
    },
    /**
     * The selected unit is not saved by value, but by index string, to allow smoother
     * changes between measurement systems. E.g. when switching from 2D polygon measuring
     * to 3D line measuring, the unit stays in kilos, in this example km² to km.
     * @param {object} state measure store state
     * @returns {String} currently selected option for measurement unit as "0" or "1"
     */
    selectedUnit (state) {
        return state.selectedUnit;
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
