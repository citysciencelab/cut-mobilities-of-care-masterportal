import {Circle, Fill, Style} from "ol/style.js";

/**
 * Creates and returns a feature style for simple points, lines or polygon.
 *
 * @param {module:ol/style/Fill} fill fill color.
 * @param {Array} colorContour The color of the contours of the drawn feature represented as an array.
 * @param {String} drawGeometryType The type of geometry to be drawn.
 * @param {Number} pointSize The size of the point.
 * @param {module:ol/style/Stroke} stroke stroke with set color and width.
 * @param {Number} zIndex Determines in which order features are rendered on the view.
 * @returns {module:ol/style/Style} style for features.
 */
export function createDrawStyle (fill, colorContour, drawGeometryType, pointSize, stroke, zIndex) {
    return new Style({
        image: new Circle({
            radius: drawGeometryType === "Point" ? pointSize / 2 : 6,
            fill: drawGeometryType === "Point" ? fill : new Fill({color: colorContour})
        }),
        fill: fill,
        stroke: stroke,
        zIndex: zIndex
    });
}
