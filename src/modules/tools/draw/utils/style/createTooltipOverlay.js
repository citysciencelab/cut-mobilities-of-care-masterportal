import Overlay from "ol/Overlay";
import thousandsSeparator from "../../../../../utils/thousandsSeparator";
import * as setters from "../../store/actions/settersDraw";

/**
 * returns the Feature to use as mouse label on change of circle or double circle
 * @param {Object} context context object for actions, getters and setters.
 *
 * @returns {ol/Feature} the Feature to use as mouse label
 */
function createToolTipOverlay ({getters, commit, dispatch}) {
    let toolTip = null;
    const decimalsForKilometers = 3,
        autoUnit = false,
        styleSettings = getters.getStyleSettings(),
        element = document.createElement("div"),
        factory = {
            mapPointerMoveEvent: evt => {
                toolTip.setPosition(evt.coordinate);
            },
            featureChangeEvent: evt => {
                if (autoUnit && evt.target.getRadius() > 500 || !autoUnit && styleSettings.unit === "km") {
                    toolTip.getElement().innerHTML = thousandsSeparator((Math.round(evt.target.getRadius()) * 0.002).toFixed(decimalsForKilometers)) + " km";
                }
                else {
                    toolTip.getElement().innerHTML = thousandsSeparator(Math.round(evt.target.getRadius() * 2)) + " m";
                }

                setters.setCircleDiameter({getters, commit, dispatch}, Math.round(evt.target.getRadius() * 2));
            }
        };

    element.className = "ol-tooltip ol-tooltip-measure";

    if (styleSettings.hasOwnProperty("tooltipStyle") && Object.keys(styleSettings.tooltipStyle).length !== 0) {
        Object.keys(styleSettings.tooltipStyle).forEach(key => {
            element.style[key] = styleSettings.tooltipStyle[key];
        });
    }

    toolTip = new Overlay({
        element,
        offset: [0, -15],
        positioning: "bottom-center"
    });

    toolTip.set("mapPointerMoveEvent", factory.mapPointerMoveEvent);
    toolTip.set("featureChangeEvent", factory.featureChangeEvent);

    return toolTip;
}

export default createToolTipOverlay;
