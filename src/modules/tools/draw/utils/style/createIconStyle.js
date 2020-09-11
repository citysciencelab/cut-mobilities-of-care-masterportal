import {Fill, Icon, Style, Text} from "ol/style.js";

/**
 * Creates and returns a feature style for points with an icon.
 *
 * @param {Array} color The color of the drawn feature represented as an array.
 * @param {Number} pointSize The size of the point.
 * @param {Object} symbol The symbol for the point.
 * @param {Number} zIndex Determines in which order features are rendered on the view.
 * @returns {module:ol/style/Style} style for points with an icon.
 * @throws Error if the type of the symbol is not supported.
 */
export function createIconStyle (color, pointSize, symbol, zIndex) {
    let style;

    if (symbol.type === "glyphicon") {
        style = new Style({
            text: new Text({
                text: symbol.value,
                font: "normal " + pointSize + "px \"Glyphicons Halflings\"",
                fill: new Fill({
                    color: color
                })
            }),
            zIndex: zIndex
        });
    }
    // The Size of the image needs to be fixed. As the example picture has a width / height of 96, this is used.
    // To use the opacity given by the color parameter it has to be separately added
    else if (symbol.type === "image") {
        style = new Style({
            image: new Icon({
                src: symbol.value,
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
