import {Style} from "ol/style.js";

import {createDrawStyle} from "./createDrawStyle";
import {createIconStyle} from "./createIconStyle";
import {createTextStyle} from "./createTextStyle";

/**
 * Creates and returns the styling for the draw interaction.
 *
 * @param {Object} state state object of the Draw Tool
 * @param {Object} state.drawType The type of the draw interaction. The first parameter represents the type unique identifier of the draw interaction as a String and the second parameter represents the geometry of the drawType as a String.
 * @param {Number} state.pointSize The size of the point.
 * @param {Object} state.symbol The symbol for the point.
 * @param {Number} state.zIndex Determines in which order features are rendered on the view.
 * @param {Object} styleSettings the settings to get the styling from
 * @param {String[]} styleSettings.color The color of the drawn feature represented as an array.
 * @param {String[]} styleSettings.colorContour The color of the contours of the drawn feature represented as an array.
 * @param {String} styleSettings.font The font used for the text interaction.
 * @param {Number} styleSettings.fontSize The size of the font used for the text interaction.
 * @param {Number} styleSettings.strokeWidth Stroke width.
 * @param {String} styleSettings.text The text to be written if the drawType "writeText" is chosen.
 * @returns {module:ol/style/Style} style of the draw interaction
 */
export function createStyle (state, styleSettings) {
    const drawType = state.drawType,
        imgPath = state.imgPath,
        pointSize = state.pointSize,
        symbol = state.symbol,
        zIndex = state.zIndex,
        color = styleSettings.color,
        colorContour = styleSettings.colorContour,
        font = styleSettings.font,
        fontSize = styleSettings.fontSize,
        strokeWidth = styleSettings.strokeWidth,
        text = styleSettings.text,
        isSimplePoint = symbol.type ? symbol.type === "simple_point" : false;
    let style = new Style();

    if (drawType.id === "drawSymbol" && !isSimplePoint) {
        style = createIconStyle(color, imgPath, pointSize, symbol, zIndex);
    }
    else if (drawType.id === "writeText") {
        style = createTextStyle(color, font, fontSize, text, 9999);
    }
    else {
        style = createDrawStyle(color, colorContour, drawType.geometry, pointSize, strokeWidth, zIndex);
    }

    return style.clone();
}
