import Overlay from "ol/Overlay";
import thousandsSeparator from "../../../../../utils/thousandsSeparator";
import * as setters from "../../store/actions/settersDraw";

/**
 * returns the Feature to use as mouse label on change of circle or double circle
 * @param {Object} context context object for actions, getters and setters.
 *
 * @returns {module:ol/Overlay} the Feature to use as mouse label
 */
function createTooltipOverlay ({getters, commit, dispatch}) {
    let tooltip = null;
    const decimalsForKilometers = 3,
        autoUnit = false,
        {styleSettings} = getters,
        element = document.createElement("div"),
        factory = {
            mapPointerMoveEvent: evt => {
                tooltip.setPosition(evt.coordinate);
            },
            featureChangeEvent: evt => {
                if (autoUnit && evt.target.getRadius() > 500 || !autoUnit && styleSettings.unit === "km") {
                    tooltip.getElement().innerHTML = thousandsSeparator(Math.round(evt.target.getRadius()).toFixed(decimalsForKilometers)) + " km";
                }
                else {
                    tooltip.getElement().innerHTML = thousandsSeparator(Math.round(evt.target.getRadius())) + " m";
                }

                setters.setCircleRadius({getters, commit, dispatch}, Math.round(evt.target.getRadius()));
            }
        };

    element.className = "ol-tooltip ol-tooltip-measure";

    if (styleSettings.hasOwnProperty("tooltipStyle") && Object.keys(styleSettings.tooltipStyle).length !== 0) {
        Object.keys(styleSettings.tooltipStyle).forEach(key => {
            element.style[key] = styleSettings.tooltipStyle[key];
        });
    }

    tooltip = new Overlay({
        element,
        offset: [0, -15],
        positioning: "bottom-center"
    });

    tooltip.set("mapPointerMoveEvent", factory.mapPointerMoveEvent);
    tooltip.set("featureChangeEvent", factory.featureChangeEvent);

    return tooltip;
}

export default createTooltipOverlay;
