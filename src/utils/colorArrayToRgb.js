import {convertColor} from "./convertColor";

/**
 * @deprecated in the next major-release! Use src/utils/convertColor instead.
 * Returns a rgb color string that can be interpreted in SVG.
 * @param   {integer[]} color color set in style
 * @returns {string} svg color
 */
export default function colorArrayToRgb (color) {
    // if (Array.isArray(color) && color.length > 2) {
    //     return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    // }
    // return "rgb(0,0,0)";

    return convertColor(color, "rgbString");
}
