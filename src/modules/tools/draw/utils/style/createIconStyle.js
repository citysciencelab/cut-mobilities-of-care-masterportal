import {Icon, Style} from "ol/style.js";

/**
 * Creates and returns a feature style for points with an icon.
 *
 * @param {String[]} color The color of the drawn feature represented as an array.
 * @param {String} imgPath path to images from rootState.wfsImgPath.
 * @param {Number} pointSize The size of the point.
 * @param {Object} symbol The symbol for the point.
 * @param {Number} zIndex Determines in which order features are rendered on the view.
 * @returns {module:ol/style/Style} style for points with an icon.
 * @throws Error if the type of the symbol is not supported.
 */
export function createIconStyle (color, imgPath, pointSize, symbol, zIndex) {
    let style;

    if (symbol.type === "image") {
        style = new Style({
            image: new Icon({
                src: symbol.value.indexOf("/") === -1 && imgPath ? imgPath + symbol.value : symbol.value,
                scale: symbol?.scale ? symbol.scale : 1 / (96 / pointSize),
                // funktioniert nicht bei kml:
                opacity: symbol?.opacity ? symbol?.opacity : color[3]
            }),
            zIndex: zIndex
        });
    }
    else {
        throw new Error(`Draw: The given type ${symbol.type} of the symbol is not supported!`);
    }
    return style;
}
