import {Style, Text} from "ol/style.js";

/**
 * Creates and returns a feature style for text.
 *
 * @param {module:ol/style/Fill} fill fill color.
 * @param {String} font The font of the text.
 * @param {String} fontSize The size of the font of the text.
 * @param {String} text The text to be written.
 * @param {Number} zIndex Determines in which order features are rendered on the view.
 * @returns {module:ol/style/Style} style for features.
 */
export function createTextStyle (fill, font, fontSize, text, zIndex) {
    return new Style({
        text: new Text({
            textAlign: "left",
            text: text,
            font: fontSize + "px " + font,
            fill: fill,
            textBaseline: "bottom"
        }),
        zIndex: zIndex
    });
}
