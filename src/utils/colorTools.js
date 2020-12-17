
/**
 * converts the given color into the given destination
 * @param {String|Number[]} color the color as "hex" (e.g. "#ffffff" || "#fff") or as "rgb" array (e.g [255, 255, 255, 0]) or as array string ("[255, 255, 255, 0]")
 * @param {String} dest the format to convert in ("hex" or "rgb")
 * @returns {String|Number[]} the converted color or the input color if it wasn't able to recognize the input
 */
function convertColor (color, dest) {
    if (Array.isArray(color)) {
        if (dest === "hex" && isRgbArray(color)) {
            return convertRgbArrayToHexColor(color);
        }
        return color;
    }
    else if (typeof color === "string") {
        if (isRgbString(color)) {
            return convertColor(convertRgbStringToHexColor(color));
        }
        else if (dest === "rgb" && isHexColorString(color)) {
            return convertHexColorStringToRgbArray(color);
        }
        return color;
    }

    return color;
}

/**
 * checks if the given color is a valid rgb array
 * @param {Number[]} color the color as rgb array with or without alpha
 * @returns {Boolean} true if this is recognized to be a rgb array or false if not
 */
function isRgbArray (color) {
    if (!Array.isArray(color) || color.length < 3) {
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
    else if (!isNaN(parseInt(color[3], 10)) && (parseFloat(color[3], 10) < 0 || parseFloat(color[3], 10) > 1)) {
        return false;
    }
    return true;
}

/**
 * converts a rgb array into a hex color
 * @param {Number[]} color the validated rgb array (use isRgbArray to make sure)
 * @returns {String} the resulting hex color or hex black if the given value is not an array
 */
function convertRgbArrayToHexColor (color) {
    if (!Array.isArray(color)) {
        return "#000000";
    }
    return "#"
        + parseInt(color[0], 10).toString(16).padStart(2, "0")
        + parseInt(color[1], 10).toString(16).padStart(2, "0")
        + parseInt(color[2], 10).toString(16).padStart(2, "0");
}

/**
 * checks if the given color is a valid rgb array as string (e.g. String("[255, 255, 255, 1]"))
 * @param {String} color the color as rgb (string) array with or without alpha
 * @returns {Boolean} true if this is recognized to be a rgb (string) array or false if not
 */
function isRgbString (color) {
    if (typeof color !== "string") {
        return false;
    }
    else if (color.indexOf("[") !== 0 || color.indexOf("]") !== color.length - 1) {
        return false;
    }

    const rgbNumbers = color.substring(1, color.length - 1).split(",");

    return isRgbArray(rgbNumbers);
}

/**
 * converts a rgb array given as string into a hex color
 * @param {String} color the validated rgb array (use isRgbString to make sure)
 * @returns {String} the resulting hex color or hex black if the given value is not an array
 */
function convertRgbStringToHexColor (color) {
    if (typeof color !== "string") {
        return convertRgbArrayToHexColor(undefined);
    }
    const rgbNumbers = color.substring(1, color.length - 1).split(",");

    return convertRgbArrayToHexColor(rgbNumbers);
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
 * converts a hex colorinto a rgb array
 * @param {String} color the validated hex color as string (use isHexColorString to make sure)
 * @returns {Number[]} the resulting rgb array or rgb black if the given value is not an array
 */
function convertHexColorStringToRgbArray (color) {
    if (typeof color !== "string") {
        return [0, 0, 0, 1];
    }
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

export {
    convertColor,
    isRgbArray,
    convertRgbArrayToHexColor,
    isRgbString,
    convertRgbStringToHexColor,
    isHexColorString,
    convertHexColorStringToRgbArray
};
