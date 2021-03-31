/**
 * destination -> manifestation
 * ------------
 * "rgb" -> [255, 255, 255]
 * "rgba" -> [255, 255, 255, 1]
 * "hex" -> "#ffffff" | "white"
 * "rgbArrayString" -> "[255, 255, 255]"
 * "rgbaArrayString" -> "[255, 255, 255, 1]"
 * "rgbString" -> "rgb(255, 255, 255)"
 * "rgbaString" -> "rgba(255, 255, 255, 1)"
 *
 * how to import
 * ------------
 * import {convertColor} from "src/utils/convertColor";
 *
 * examples
 * ------------
 *          [255, 255, 255] := convertColor("rgb(255, 255, 255)", "rgb") .
 * "rgba(255, 255, 255, 1)" := convertColor([255, 255, 255, 1], "rgbaString") .
 *                "#ffffff" := convertColor("white", "hex") .
 */

/**
 * converts the given color manifestation into the given destination
 * @param {*} color the color as some color manifestation
 * @param {String} dest the format to convert into as String (rgb, rgba, hex, rgbArrayString, rgbaArrayString, rgbString, rgbaString)
 * @returns {*} the converted color or black if the input can't be recognized
 */
function convertColor (color, dest = "rgba") {
    let transColor = [];

    if (isRgbArray(color)) {
        // [255, 255, 255]
        transColor = color.concat([1]);
    }
    else if (isRgbaArray(color)) {
        // [255, 255, 255, 1]
        transColor = color;
    }
    else if (isHexColorString(color)) {
        // "#ffffff"
        transColor = parseHexColorString(color);
    }
    else if (isCssColorString(color)) {
        // "black"
        transColor = parseCssColorString(color);
    }
    else if (isRgbArrayString(color)) {
        // "[255, 255, 255]"
        transColor = JSON.parse(color).concat([1]);
    }
    else if (isRgbaArrayString(color)) {
        // "[255, 255, 255, 1]"
        transColor = JSON.parse(color);
    }
    else if (isRgbColorString(color)) {
        // "rgb(255, 255, 255)"
        transColor = parseRgbColorString(color);
    }
    else if (isRgbaColorString(color)) {
        // "rgba(255, 255, 255, 1)"
        transColor = parseRgbaColorString(color);
    }
    else {
        // anything else is black
        transColor = [0, 0, 0, 1];
    }

    // transColor is an array [r, g, b, a]
    switch (dest) {
        case "rgb":
            // -> [255, 255, 255]
            return transColor.slice(0, 3);
        case "rgba":
            // -> [255, 255, 255, 1]
            return transColor;
        case "hex":
            // -> "#ffffff"
            return convertToHexColor(transColor);
        case "rgbArrayString":
            // -> "[255, 255, 255]"
            return convertToRgbArrayString(transColor);
        case "rgbaArrayString":
            // -> "[255, 255, 255, 1]"
            return convertToRgbaArrayString(transColor);
        case "rgbString":
            // -> "rgb(255, 255, 255)"
            return convertToRgbString(transColor);
        case "rgbaString":
            // -> "rgba(255, 255, 255, 1)"
            return convertToRgbaString(transColor);
        default:
    }

    // any other destination defaults to "rgba"
    return transColor;
}


// CHECKS

/**
 * checks if the given color is a valid rgb array
 * @param {Number[]} color the color as rgb array (without alpha)
 * @returns {Boolean} true if this is recognized to be a rgb array or false if not
 */
function isRgbArray (color) {
    if (!Array.isArray(color) || color.length !== 3) {
        return false;
    }
    else if (isNaN(parseInt(color[0], 10)) || parseInt(color[0], 10) < 0 || parseInt(color[0], 10) > 255) {
        return false;
    }
    else if (isNaN(parseInt(color[1], 10)) || parseInt(color[1], 10) < 0 || parseInt(color[1], 10) > 255) {
        return false;
    }
    else if (isNaN(parseInt(color[2], 10)) || parseInt(color[2], 10) < 0 || parseInt(color[2], 10) > 255) {
        return false;
    }
    return true;
}

/**
 * checks if the given color is a valid rgba array
 * @param {Number[]} color the color as rgba array (with alpha)
 * @returns {Boolean} true if this is recognized to be an rgba array or false if not
 */
function isRgbaArray (color) {
    if (!Array.isArray(color) || color.length !== 4) {
        return false;
    }
    else if (!isRgbArray(color.slice(0, 3))) {
        return false;
    }
    else if (isNaN(parseFloat(color[3])) || parseFloat(color[3]) < 0 || parseFloat(color[3]) > 1) {
        return false;
    }
    return true;
}

/**
 * checks if the given color is a valid hex color
 * @param {String} color the color as hex color
 * @returns {Boolean} true if this is recognized to be a hex color or false if not
 */
function isHexColorString (color) {
    if (typeof color !== "string") {
        return false;
    }
    else if (color.indexOf("#") !== 0 || (color.length !== 4 && color.length !== 7)) {
        return false;
    }

    return (/^[a-f\d]*$/i).test(color.substring(1));
}

/**
 * checks if the given color is a css color string (e.g. "black")
 * @param {String} color the color as css color string
 * @returns {Boolean} true if this is recognized to be a css color string or false if not
 */
function isCssColorString (color) {
    if (typeof color !== "string") {
        return false;
    }
    else if (!getCssColorMap().hasOwnProperty(color.toLowerCase())) {
        return false;
    }
    return true;
}

/**
 * checks if the given color is a valid rgb array disguised as string (e.g. String("[255, 255, 255]"))
 * @param {String} color the color as rgb string array without alpha
 * @returns {Boolean} true if this is recognized to be an rgb string array or false if not
 */
function isRgbArrayString (color) {
    if (typeof color !== "string") {
        return false;
    }
    try {
        return isRgbArray(JSON.parse(color));
    }
    catch (e) {
        return false;
    }
}

/**
 * checks if the given color is a valid rgba array disguised as string (e.g. String("[255, 255, 255, 1]"))
 * @param {String} color the color as rgba string array with alpha
 * @returns {Boolean} true if this is recognized to be an rgb string array with alpha or false if not
 */
function isRgbaArrayString (color) {
    if (typeof color !== "string") {
        return false;
    }
    try {
        return isRgbaArray(JSON.parse(color));
    }
    catch (e) {
        return false;
    }
}

/**
 * checks if the given input is an rgb color string (e.g. "rgb(255, 255, 255)")
 * @param {String} color the input as rgb string
 * @returns {Boolean} true if this is recognized to be an rgb string
 */
function isRgbColorString (color) {
    if (typeof color !== "string") {
        return false;
    }
    else if (color.indexOf("rgb(") !== 0 || color.indexOf(")") !== color.length - 1) {
        return false;
    }
    const rgbNumbers = color.substring(4, color.length - 1).split(",");

    try {
        return isRgbArray(rgbNumbers);
    }
    catch (e) {
        return false;
    }
}

/**
 * checks if the given input is an rgba color string (e.g. "rgb(255, 255, 255, 1)")
 * @param {String} color the input as rgba string
 * @returns {Boolean} true if this is recognized to be an rgba string
 */
function isRgbaColorString (color) {
    if (typeof color !== "string") {
        return false;
    }
    else if (color.indexOf("rgba(") !== 0 || color.indexOf(")") !== color.length - 1) {
        return false;
    }
    const rgbNumbers = color.substring(5, color.length - 1).split(",");

    try {
        return isRgbaArray(rgbNumbers);
    }
    catch (e) {
        return false;
    }
}


// PARSE TO RGBA ARRAY

/**
 * parses a hex color string
 * @param {String} color a (validated) hex color
 * @returns {Number[]} the rgba array
 */
function parseHexColorString (color) {
    let hexNumbers;

    if (color.length === 4) {
        hexNumbers = color.substring(1).split("").map(value => {
            return value.padStart(2, value);
        });
    }
    else if (color.length === 7) {
        hexNumbers = color.substring(1).match(/.{2}/g);
    }
    else {
        return [0, 0, 0, 1];
    }

    return hexNumbers.map(value => {
        return parseInt(value, 16);
    }).concat([1]);
}

/**
 * parses a css color string
 * @param {String} color a (validated) css color string (e.g. "black")
 * @returns {Number[]} the rgba array
 */
function parseCssColorString (color) {
    return getCssColorMap()[color.toLowerCase()];
}

/**
 * parses an rgb color string
 * @param {String} color a (validated) rgb color string (e.g. "rgb(255,255,255)")
 * @returns {Number[]} the rgba array
 */
function parseRgbColorString (color) {
    const result = color.substring(4, color.length - 1).split(",");

    result[0] = parseInt(result[0], 10);
    result[1] = parseInt(result[1], 10);
    result[2] = parseInt(result[2], 10);
    result[3] = 1;
    return result;
}

/**
 * parses an rgba color string
 * @param {String} color a (validated) rgba color string (e.g. "rgb(255,255,255,1)")
 * @returns {Number[]} the rgba array
 */
function parseRgbaColorString (color) {
    const result = color.substring(5, color.length - 1).split(",");

    result[0] = parseInt(result[0], 10);
    result[1] = parseInt(result[1], 10);
    result[2] = parseInt(result[2], 10);
    result[3] = parseFloat(result[3]);
    return result;
}


// CONVERT TO DESTINATION

/**
 * converts an rgba array into a hex color
 * @param {Number[]} color the validated rgba array
 * @returns {String} the resulting hex color string
 */
function convertToHexColor (color) {
    return "#"
        + parseInt(color[0], 10).toString(16).padStart(2, "0")
        + parseInt(color[1], 10).toString(16).padStart(2, "0")
        + parseInt(color[2], 10).toString(16).padStart(2, "0");
}

/**
 * converts an rgba array into an rgb array string
 * @param {Number[]} color the validated rgba array
 * @returns {String} the resulting rgb array string
 */
function convertToRgbArrayString (color) {
    return "["
        + String(color[0]) + ", "
        + String(color[1]) + ", "
        + String(color[2]) + "]";
}

/**
 * converts an rgba array into an rgba array string
 * @param {Number[]} color the validated rgba array
 * @returns {String} the resulting rgba array string
 */
function convertToRgbaArrayString (color) {
    return "["
        + String(color[0]) + ", "
        + String(color[1]) + ", "
        + String(color[2]) + ", "
        + String(color[3]) + "]";
}

/**
 * converts an rgba array into an rgb string
 * @param {Number[]} color the validated rgba array
 * @returns {String} the resulting rgb string
 */
function convertToRgbString (color) {
    return "rgb("
        + String(color[0]) + ", "
        + String(color[1]) + ", "
        + String(color[2]) + ")";
}

/**
 * converts an rgba array into an rgba string
 * @param {Number[]} color the validated rgba array
 * @returns {String} the resulting rgba string
 */
function convertToRgbaString (color) {
    return "rgba("
        + String(color[0]) + ", "
        + String(color[1]) + ", "
        + String(color[2]) + ", "
        + String(color[3]) + ")";
}


// MAPPING

/**
 * returns the css color map
 * @returns {Object} the css color map
 */
function getCssColorMap () {
    return {
        aliceblue: [240, 248, 255, 1],
        antiquewhite: [250, 235, 215, 1],
        aqua: [0, 255, 255, 1],
        aquamarine: [127, 255, 212, 1],
        azure: [240, 255, 255, 1],
        beige: [245, 245, 220, 1],
        bisque: [255, 228, 196, 1],
        black: [0, 0, 0, 1],
        blanchedalmond: [255, 235, 205, 1],
        blue: [0, 0, 255, 1],
        blueviolet: [138, 43, 226, 1],
        brown: [165, 42, 42, 1],
        burlywood: [222, 184, 135, 1],
        cadetblue: [95, 158, 160, 1],
        chartreuse: [127, 255, 0, 1],
        chocolate: [210, 105, 30, 1],
        coral: [255, 127, 80, 1],
        cornflowerblue: [100, 149, 237, 1],
        cornsilk: [255, 248, 220, 1],
        crimson: [220, 20, 60, 1],
        cyan: [0, 255, 255, 1],
        darkblue: [0, 0, 139, 1],
        darkcyan: [0, 139, 139, 1],
        darkgoldenrod: [184, 134, 11, 1],
        darkgray: [169, 169, 169, 1],
        darkgrey: [169, 169, 169, 1],
        darkgreen: [0, 100, 0, 1],
        darkkhaki: [189, 183, 107, 1],
        darkmagenta: [139, 0, 139, 1],
        darkolivegreen: [85, 107, 47, 1],
        darkorange: [255, 140, 0, 1],
        darkorchid: [153, 50, 204, 1],
        darkred: [139, 0, 0, 1],
        darksalmon: [233, 150, 122, 1],
        darkseagreen: [143, 188, 143, 1],
        darkslateblue: [72, 61, 139, 1],
        darkslategray: [47, 79, 79, 1],
        darkslategrey: [47, 79, 79, 1],
        darkturquoise: [0, 206, 209, 1],
        darkviolet: [148, 0, 211, 1],
        deeppink: [255, 20, 147, 1],
        deepskyblue: [0, 191, 255, 1],
        dimgray: [105, 105, 105, 1],
        dimgrey: [105, 105, 105, 1],
        dodgerblue: [30, 144, 255, 1],
        firebrick: [178, 34, 34, 1],
        floralwhite: [255, 250, 240, 1],
        forestgreen: [34, 139, 34, 1],
        fuchsia: [255, 0, 255, 1],
        gainsboro: [220, 220, 220, 1],
        ghostwhite: [248, 248, 255, 1],
        gold: [255, 215, 0, 1],
        goldenrod: [218, 165, 32, 1],
        gray: [128, 128, 128, 1],
        grey: [128, 128, 128, 1],
        green: [0, 128, 0, 1],
        greenyellow: [173, 255, 47, 1],
        honeydew: [240, 255, 240, 1],
        hotpink: [255, 105, 180, 1],
        indianred: [205, 92, 92, 1],
        indigo: [75, 0, 130, 1],
        ivory: [255, 255, 240, 1],
        khaki: [240, 230, 140, 1],
        lavender: [230, 230, 250, 1],
        lavenderblush: [255, 240, 245, 1],
        lawngreen: [124, 252, 0, 1],
        lemonchiffon: [255, 250, 205, 1],
        lightblue: [173, 216, 230, 1],
        lightcoral: [240, 128, 128, 1],
        lightcyan: [224, 255, 255, 1],
        lightgoldenrodyellow: [250, 250, 210, 1],
        lightgray: [211, 211, 211, 1],
        lightgrey: [211, 211, 211, 1],
        lightgreen: [144, 238, 144, 1],
        lightpink: [255, 182, 193, 1],
        lightsalmon: [255, 160, 122, 1],
        lightseagreen: [32, 178, 170, 1],
        lightskyblue: [135, 206, 250, 1],
        lightslategray: [119, 136, 153, 1],
        lightslategrey: [119, 136, 153, 1],
        lightsteelblue: [176, 196, 222, 1],
        lightyellow: [255, 255, 224, 1],
        lime: [0, 255, 0, 1],
        limegreen: [50, 205, 50, 1],
        linen: [250, 240, 230, 1],
        magenta: [255, 0, 255, 1],
        maroon: [128, 0, 0, 1],
        mediumaquamarine: [102, 205, 170, 1],
        mediumblue: [0, 0, 205, 1],
        mediumorchid: [186, 85, 211, 1],
        mediumpurple: [147, 112, 219, 1],
        mediumseagreen: [60, 179, 113, 1],
        mediumslateblue: [123, 104, 238, 1],
        mediumspringgreen: [0, 250, 154, 1],
        mediumturquoise: [72, 209, 204, 1],
        mediumvioletred: [199, 21, 133, 1],
        midnightblue: [25, 25, 112, 1],
        mintcream: [245, 255, 250, 1],
        mistyrose: [255, 228, 225, 1],
        moccasin: [255, 228, 181, 1],
        navajowhite: [255, 222, 173, 1],
        navy: [0, 0, 128, 1],
        oldlace: [253, 245, 230, 1],
        olive: [128, 128, 0, 1],
        olivedrab: [107, 142, 35, 1],
        orange: [255, 165, 0, 1],
        orangered: [255, 69, 0, 1],
        orchid: [218, 112, 214, 1],
        palegoldenrod: [238, 232, 170, 1],
        palegreen: [152, 251, 152, 1],
        paleturquoise: [175, 238, 238, 1],
        palevioletred: [219, 112, 147, 1],
        papayawhip: [255, 239, 213, 1],
        peachpuff: [255, 218, 185, 1],
        peru: [205, 133, 63, 1],
        pink: [255, 192, 203, 1],
        plum: [221, 160, 221, 1],
        powderblue: [176, 224, 230, 1],
        purple: [128, 0, 128, 1],
        rebeccapurple: [102, 51, 153, 1],
        red: [255, 0, 0, 1],
        rosybrown: [188, 143, 143, 1],
        royalblue: [65, 105, 225, 1],
        saddlebrown: [139, 69, 19, 1],
        salmon: [250, 128, 114, 1],
        sandybrown: [244, 164, 96, 1],
        seagreen: [46, 139, 87, 1],
        seashell: [255, 245, 238, 1],
        sienna: [160, 82, 45, 1],
        silver: [192, 192, 192, 1],
        skyblue: [135, 206, 235, 1],
        slateblue: [106, 90, 205, 1],
        slategray: [112, 128, 144, 1],
        slategrey: [112, 128, 144, 1],
        snow: [255, 250, 250, 1],
        springgreen: [0, 255, 127, 1],
        steelblue: [70, 130, 180, 1],
        tan: [210, 180, 140, 1],
        teal: [0, 128, 128, 1],
        thistle: [216, 191, 216, 1],
        tomato: [255, 99, 71, 1],
        turquoise: [64, 224, 208, 1],
        violet: [238, 130, 238, 1],
        wheat: [245, 222, 179, 1],
        white: [255, 255, 255, 1],
        whitesmoke: [245, 245, 245, 1],
        yellow: [255, 255, 0, 1],
        yellowgreen: [154, 205, 50, 1]
    };
}


export {
    convertColor,
    isRgbArray,
    isRgbaArray,
    isHexColorString,
    isCssColorString,
    isRgbArrayString,
    isRgbaArrayString,
    isRgbColorString,
    isRgbaColorString,
    parseHexColorString,
    parseCssColorString,
    parseRgbColorString,
    parseRgbaColorString,
    convertToHexColor,
    convertToRgbArrayString,
    convertToRgbaArrayString,
    convertToRgbString,
    convertToRgbaString,
    getCssColorMap
};
