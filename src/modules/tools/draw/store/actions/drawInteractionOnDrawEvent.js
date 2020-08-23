import {createStyle} from "../../utils/style/createStyle";
import {calculateCircle} from "../../utils/circleCalculations";
import {transformNaNToNull} from "../../../../../utils/transformNaNToNull";

const errorBorder = "#E10019";

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
                state.innerBorderColor = errorBorder;

                if (drawType.id === "drawDoubleCircle") {
                    if (outerDiameter === null || outerDiameter === 0) {
                        dispatch("Alerting/addSingleAlert", i18next.t("common:modules.tools.draw.undefinedTwoCircles"), {root: true});
                        layerSource.removeFeature(event.feature);
                        state.outerBorderColor = errorBorder;
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
                        state.outerBorderColor = errorBorder;
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
