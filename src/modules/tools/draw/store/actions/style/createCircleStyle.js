import {Circle, Style} from "ol/style.js";

/**
 * Creates and returns a feature style for circles and double circles.
 *
 * @param {module:ol/style/Fill} fill fill color.
 * @param {module:ol/style/Stroke} stroke stroke with set color and width.
 * @param {Number} zIndex Determines in which order features are rendered on the view.
 * @returns {module:ol/style/Style} style for circle features.
 */
export function createCircleStyle (fill, stroke, zIndex) {
    return new Style({
        image: new Circle({
            radius: 6,
            stroke: stroke,
            fill: fill
        }),
        stroke: stroke,
        fill: fill,
        zIndex: zIndex
    });
}
