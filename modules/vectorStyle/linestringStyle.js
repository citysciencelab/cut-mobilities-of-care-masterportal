import StyleModel from "./style.js";
import {Style, Stroke} from "ol/style.js";

const LinestringStyleModel = StyleModel.extend(/** @lends LinestringStyleModel.prototype */{
    /**
     * @description Class to create ol.style.Style
     * @class LinestringStyleModel
     * @extends StyleModel
     * @memberof VectorStyle.Style
     * @constructs
     * @property {ol/feature} feature Feature to be styled.
     * @property {object} styles styling properties to overwrite defaults
     * @property {Boolean} isClustered Flag to show if feature is clustered.
     */
    defaults: {
        "lineStrokeColor": [255, 0, 0, 1],
        "lineStrokeWidth": 5,
        "lineStrokeCap": "round",
        "lineStrokeJoin": "round",
        "lineStrokeDash": undefined,
        "lineStrokeDashOffset": 0,
        "lineStrokeMiterLimit": 10
    },

    initialize: function (feature, styles, isClustered) {
        this.setFeature(feature);
        this.setIsClustered(isClustered);
        this.overwriteStyling(styles);
    },

    /**
     * This function returns a style for each feature.
     * @returns {ol/style/Style} - The created style.
     */
    getStyle: function () {
        return new Style({
            stroke: new Stroke({
                lineCap: this.get("lineStrokeCap"),
                lineJoin: this.get("lineStrokeJoin"),
                lineDash: this.get("lineStrokeDash"),
                lineDashOffset: this.get("lineStrokeDashOffset"),
                miterLimit: this.get("lineStrokeMiterLimit"),
                color: this.get("lineStrokeColor"),
                width: this.get("lineStrokeWidth")
            })
        });
    },

    /**
     * Returns input color to destinated color.
     * possible values for dest are "rgb" and "hex".
     * color has to come as hex (e.g. "#ffffff" || "#fff") or as array (e.g [255,255,255,0]) or as String ("[255,255,255,0]")
     * @param {Number[]|String} color The color to return.
     * @param {String} dest Destination color type.
     * @returns {String|Number[]} - The converted color.
     */
    returnColor: function (color, dest) {
        let src,
            newColor = color,
            pArray = [];

        if (Array.isArray(newColor)) {
            src = "rgb";
        }
        else if (typeof newColor === "string" && newColor.indexOf("#") === 0) {
            src = "hex";
        }
        else if (typeof newColor === "string" && newColor.indexOf("#") === -1) {
            src = "rgb";

            pArray = newColor.replace("[", "").replace("]", "").replace(/ /g, "").split(",");
            newColor = [
                pArray[0], pArray[1], pArray[2], pArray[3]
            ];
        }

        if (src === "hex" && dest === "rgb") {
            newColor = this.hexToRgb(newColor);
        }
        else if (src === "rgb" && dest === "hex") {
            newColor = this.rgbToHex(newColor[0], newColor[1], newColor[2]);
        }

        newColor = dest === "rgb" ? this.normalizeRgbColor(newColor) : newColor;

        return newColor;
    },

    /**
     * Converts hex value to rgbarray.
     * @param {String} hex Color as hex string.
     * @returns {Number[]} - Color als rgb array.
     */
    hexToRgb: function (hex) {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i,
            hexReplace = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });
        let result;

        result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i;
        result = result.exec(hexReplace);

        return result ? [parseFloat(result[1], 16), parseFloat(result[2], 16), parseFloat(result[3], 16)] : null;
    },

    /**
     * Converts rgb to hex.
     * @param {Number} r Red value.
     * @param {Number} g Green Value.
     * @param {Number} b Blue value.
     * @returns {String} - Hex color string.
     */
    rgbToHex: function (r, g, b) {
        return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
    },

    /**
     * Makes sure that one rgb color always consists of four values
     * @param {Number[]} newColor Color in rgb
     * @return {Number[]} normColor
     */
    normalizeRgbColor: function (newColor) {
        const defaultArray = [1, 1, 1, 1];

        return newColor.concat(defaultArray).slice(0, 4);
    },

    /**
     * Converts number to hex string.
     * @param {Number} c Color value as number.
     * @returns {String} - Converted color number as hex string.
     */
    componentToHex: function (c) {
        const hex = Number(c).toString(16);

        return hex.length === 1 ? "0" + hex : hex;
    }
});

export default LinestringStyleModel;
