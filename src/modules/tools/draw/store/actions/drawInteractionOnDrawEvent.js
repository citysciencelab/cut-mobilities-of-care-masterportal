import {createStyle} from "./style/createStyle";
import {getMapProjection} from "masterportalAPI/src/crs";
import {toLonLat, transform} from "ol/proj";
import {transformNaNToNull} from "../../../../../utils/transformNaNToNull";

const earthRadius = 6378137;

/**
 * Helper Function to coordinate the calculation of a circle.
 *
 * @param {Event} event Event sent when drawing a feature on the map.
 * @param {module:ol/coordinate~Coordinate} circleCenter The center of the circle to be calculated.
 * @param {Number} circleDiameter The diameter of the circle to be calculated.
 * @param {module:ol/Map} map Map object.
 * @returns {void}
 */
function calculateCircle (event, circleCenter, circleDiameter, map) {
    const resultCoordinates = [
        getCircleExtentByDistanceLat(circleCenter, circleDiameter, map),
        getCircleExtentByDistanceLat(circleCenter, -1 * circleDiameter, map),
        getCircleExtentByDistanceLon(circleCenter, circleDiameter, map),
        getCircleExtentByDistanceLon(circleCenter, -1 * circleDiameter, map)
    ];

    // The northernmost point of the circle is described by the longitude (northing) of that point (0).
    // The southernmost point is described by the longitude (northing) of that point (1).
    // The easternmost point is described by the latitude (easting) of that point (2).
    // The westernmost point is described by the latitude (easting) of that point (3).
    // They must be added to the array in the following order: [3, 1, 2, 0]
    event.feature.getGeometry().extent_ = [
        resultCoordinates[3][0],
        resultCoordinates[1][1],
        resultCoordinates[2][0],
        resultCoordinates[0][1]
    ];
    event.feature.getGeometry().flatCoordinates = [
        circleCenter[0],
        circleCenter[1],
        resultCoordinates[3][0],
        resultCoordinates[3][1]
    ];
}

/**
 * Calculates new flat and extent latitude coordinates for the (circle-) feature.
 * These coordiantes are calculated on the basis of the circle diameter specified by the user.
 *
 * @param {module:ol/coordinate~Coordinate} circleCenter The center of the circle to be calculated.
 * @param {Number} circleDiameter The diameter of the circle to be calculated.
 * @param {module:ol/Map} map Map object.
 * @returns {module:ol/coordinate~Coordinate} New and transformed extent / flat coordinates of the circle.
 */
function getCircleExtentByDistanceLat (circleCenter, circleDiameter, map) {
    const offsetLat = circleDiameter / 2,
        circleCenterWGS = toLonLat(circleCenter, getMapProjection(map)),
        deltaLat = offsetLat / earthRadius,
        newPositionLat = circleCenterWGS[1] + deltaLat * 180 / Math.PI;

    return transform([circleCenterWGS[0], newPositionLat], "EPSG:4326", getMapProjection(map));
}

/**
 * Calculates new flat and extent longitude coordinates for the (circle-) feature.
 * These coordiantes are calculated on the basis of the circle diameter specified by the user.
 *
 * @param {module:ol/coordinate~Coordinate} circleCenter The center of the circle to be calculated.
 * @param {Number} circleDiameter The diameter of the circle to be calculated.
 * @param {module:ol/Map} map Map object.
 * @returns {module:ol/coordinate~Coordinate} New and transformed extent / flat coordinates of the circle.
 */
function getCircleExtentByDistanceLon (circleCenter, circleDiameter, map) {
    const offsetLon = circleDiameter / 2,
        circleCenterWGS = toLonLat(circleCenter, getMapProjection(map)),
        deltaLon = offsetLon / (earthRadius * Math.cos(Math.PI * circleCenterWGS[1] / 180)),
        newPositionLon = circleCenterWGS[0] + deltaLon * 180 / Math.PI;

    return transform([newPositionLon, circleCenterWGS[1]], "EPSG:4326", getMapProjection(map));
}

/**
* Creates a listener for the addfeature event of the source of the layer used for the Draw Tool.
* NOTE: Should the zIndex only be counted up if the feature gets actually drawn?
*
* @param {Object} context actions context object.
* @param {Object} payload payload object.
* @param {String} payload.drawInteraction Either an empty String or "Two" to identify for which drawInteraction this is used.
* @param {Boolean} payload.doubleCircle Determines if a doubleCircle is supposed to be drawn.
* @returns {void}
*/
export function drawInteractionOnDrawEvent ({state, commit, dispatch, rootState}, {drawInteraction, doubleCircle}) {
    const interaction = state["drawInteraction" + drawInteraction],
        circleMethod = state.circleMethod,
        drawType = state.drawType,
        layerSource = state.layer.getSource();

    commit("setAddFeatureListener", layerSource.once("addfeature", event => {
        if (circleMethod === "defined" && drawType.geometry === "Circle") {
            const innerDiameter = transformNaNToNull(state.circleInnerDiameter),
                outerDiameter = transformNaNToNull(state.circleOuterDiameter),
                circleDiameter = doubleCircle ? outerDiameter : innerDiameter,
                circleCenter = event.feature.getGeometry().getCenter();

            if (innerDiameter === null || innerDiameter === 0) {
                state.innerBorderColor = "#E10019";

                if (drawType.id === "drawDoubleCircle") {
                    if (outerDiameter === null || outerDiameter === 0) {
                        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedTwoCircles"), {root: true});
                        layerSource.removeFeature(event.feature);
                        state.outerBorderColor = "#E10019";
                    }
                    else {
                        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedInnerCircle"), {root: true});
                        layerSource.removeFeature(event.feature);
                        state.outerBorderColor = "";
                    }
                }
                else {
                    dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedDiameter"), {root: true});
                    layerSource.removeFeature(event.feature);
                }
            }
            else {
                if (outerDiameter === null || outerDiameter === 0) {
                    if (drawType.id === "drawDoubleCircle") {
                        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedOuterCircle"), {root: true});
                        layerSource.removeFeature(event.feature);
                        state.outerBorderColor = "#E10019";
                    }
                    else {
                        calculateCircle(event, circleCenter, circleDiameter, rootState.Map.map);
                    }
                }
                else {
                    calculateCircle(event, circleCenter, circleDiameter, rootState.Map.map);
                    state.outerBorderColor = "";
                }
                state.innerBorderColor = "";
            }
        }
        event.feature.setStyle(createStyle(state));
        commit("setZIndex", state.zIndex + 1);
    }));

    if (circleMethod === "defined" && drawType.geometry === "Circle") {
        interaction.finishDrawing();
    }
}
