import {Stroke, Style, Fill, Circle} from "ol/style";

import {mobilityModeColors} from "../store/constantsMobilityDataDraw";

/**
 * Creates and returns the styles for mobility data lines while drawing.
 *
 * @param {string} mobilityMode the currently selected mobility mode
 * @returns {Array<module:ol/style/Style>} the styles to render the feature
 */
export function getMobilityDataDrawLineStyle (mobilityMode) {
    const mobilityModeColor = mobilityModeColors[mobilityMode].hex;

    return [
        new Style({
            stroke: new Stroke({
                color: mobilityModeColor,
                width: 3
            }),
            image: new Circle({
                radius: 4,
                fill: new Fill({
                    color: mobilityModeColor
                })
            }),
            zIndex: Infinity
        })
    ];
}

/**
 * Creates and returns the styles for mobility data points while drawing.
 *
 * @returns {Array<module:ol/style/Style>} the styles to render the feature
 */
export function getMobilityDataDrawPointStyle () {
    return [
        new Style({
            image: new Circle({
                radius: 8,
                fill: new Fill({
                    color: "#3F51B5"
                }),
                stroke: new Stroke({
                    color: "#fff",
                    width: 2
                })
            }),
            zIndex: Infinity
        })
    ];
}

/**
 * Creates and returns the styles for mobility data while modifying.
 *
 * @returns {Array<module:ol/style/Style>} the styles to render the feature
 */
export function getMobilityDataModifyStyle () {
    return [
        new Style({
            image: new Circle({
                radius: 6,
                fill: new Fill({
                    color: "#3F51B5"
                }),
                stroke: new Stroke({
                    color: "#fff",
                    width: 2
                })
            }),
            zIndex: Infinity
        })
    ];
}
