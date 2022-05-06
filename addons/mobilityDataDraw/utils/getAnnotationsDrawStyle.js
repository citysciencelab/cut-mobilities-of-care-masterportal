import {RegularShape, Circle, Fill, Stroke, Style} from "ol/style";

import {annotationColor, mobilityModeColors} from "../store/constantsMobilityDataDraw";

/**
 * Creates and returns the styles for annotations lines or areas while drawing.
 *
 * @returns {Array<module:ol/style/Style>} the styles to render the feature
 */
export function getAnnotationsDrawLineStyle (mobilityMode, drawingMode) {
    if (drawingMode === "LineString") {
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
    } else {
        return [
            new Style({
                fill: new Fill({
                    color: "rgba(255,255,255,0.4)"
                }),
                stroke: new Stroke({
                    color: annotationColor.fill,
                    width: 3
                }),
                image: new Circle({
                    radius: 4,
                    fill: new Fill({
                        color: annotationColor.fill
                    })
                }),
                zIndex: Infinity
            })
        ];
    }
}

/**
 * Creates and returns the styles for annotations points while drawing.
 *
 * @returns {Array<module:ol/style/Style>} the styles to render the feature
 */
export function getAnnotationsDrawPointStyle () {
    return [
        new Style({
            image: new RegularShape({
                points: 4,
                radius: 8,
                fill: new Fill({
                    color: annotationColor.fill
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
