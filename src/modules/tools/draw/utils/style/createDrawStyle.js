import {Circle, Fill, Stroke, Style} from "ol/style.js";

/**
 * Creates and returns a feature style for simple points, lines or polygon.
 *
 * @param {String[]} color The color of the drawn feature represented as an array.
 * @param {String[]} colorContour The color of the contours of the drawn feature represented as an array.
 * @param {String} drawGeometryType The type of geometry to be drawn.
 * @param {Number} pointSize The size of the point.
 * @param {Number} strokeWidth Stroke width.
 * @param {Number} zIndex Determines in which order features are rendered on the view.
 * @returns {module:ol/style/Style} style for features.
 */
export function createDrawStyle (color, colorContour, drawGeometryType, pointSize, strokeWidth, zIndex) {
    return new Style({
        image: new Circle({
            radius: drawGeometryType === "Point" ? pointSize / 2 : 0,
            fill: drawGeometryType === "Point"
                ? new Fill({color: color})
                : new Fill({color: colorContour})
        }),
        fill: new Fill({
            color: color
        }),
        stroke: new Stroke({
            color: colorContour,
            width: strokeWidth
        }),
        zIndex: zIndex
    });
}
