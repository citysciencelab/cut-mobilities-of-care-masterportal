import {Style} from "ol/style.js";

import {createDrawStyle} from "./createDrawStyle";
import {createIconStyle} from "./createIconStyle";
import {createTextStyle} from "./createTextStyle";

/**
 * Creates and returns the styling for the draw interaction.
 *
 * @param {Object} state state object of the Draw Tool
 * @param {Array} state.color The color of the drawn feature represented as an array.
 * @param {Array} state.colorContour The color of the contours of the drawn feature represented as an array.
 * @param {Object} state.drawType The type of the draw interaction. The first parameter represents the type unique identifier of the draw interaction as a String and the second parameter represents the geometry of the drawType as a String.
 * @param {String} state.font The font used for the text interaction.
 * @param {Number} state.fontSize The size of the font used for the text interaction.
 * @param {Number} state.pointSize The size of the point.
 * @param {Number} state.strokeWidth Stroke width.
 * @param {Object} state.symbol The symbol for the point.
 * @param {String} state.text The text to be written if the drawType "writeText" is chosen.
 * @param {Number} state.zIndex Determines in which order features are rendered on the view.
 * @returns {module:ol/style/Style} style of the draw interaction
 */
export function createStyle ({color, colorContour, drawType, font, fontSize, pointSize, strokeWidth, symbol, text, zIndex}) {
    const isSvg = symbol.type ? symbol.type === "svg" : false; // svg or icon
    let style = new Style();

    if (drawType.id === "drawSymbol" && !isSvg) {
        style = createIconStyle(color, pointSize, symbol, zIndex);
    }
    else if (drawType.id === "writeText") {
        style = createTextStyle(color, font, fontSize, text, 9999);
    }
    else {
        style = createDrawStyle(color, colorContour, drawType.geometry, pointSize, strokeWidth, zIndex);
    }

    return style.clone();
}
