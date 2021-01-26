import {Circle, Fill, Stroke, Style} from "ol/style.js";

/**
 * Creates and returns a feature style for circles and double circles.
 *
 * @param {String[]} color The color of the drawn feature represented as an array.
 * @param {String[]} colorContour The color of the contours of the drawn feature represented as an array.
 * @param {Number} strokeWidth Stroke width.
 * @param {Number} zIndex Determines in which order features are rendered on the view.
 * @returns {module:ol/style/Style} style for circle features.
 */
export function createCircleStyle (color, colorContour, strokeWidth, zIndex) {
    return new Style({
        image: new Circle({
            radius: 6,
            stroke: new Stroke({
                color: colorContour,
                width: strokeWidth
            }),
            fill: new Fill({
                color: color
            })
        }),
        stroke: new Stroke({
            color: colorContour,
            width: strokeWidth
        }),
        fill: new Fill({
            color: color
        }),
        zIndex: zIndex
    });
}
