import {scaleLinear, scaleSequential} from "d3-scale";
import * as Chromatic from "d3-scale-chromatic";

const ColorScale = Backbone.Model.extend(/** @lends ColorScale.prototype */{
    defaults: {},
    /**
     * @class ColorScale
     * @memberOf Tools.ColorScale
     * @constructs
     * @extends Backbone.Model
     * @listens Tools.ColorScale#RadioRequestGetColorScaleByValues
     */
    initialize: function () {
        const channel = Radio.channel("ColorScale");

        channel.reply({
            "getColorScaleByValues": function (values, colorspace, type) {
                return this.generateColorScale(values, colorspace, type);
            }
        }, this);
    },

    /**
     * generates a function to use for color generation from values
     * @param {number[]} values - Array of all values to build the scale from. Default: [0, 1]
     * @param {d3.interpolator|color[]} colorspace - colorspace of the scale, either 2 values for linearScale or string selector for d3.interpolator from d3-scale-chromatic. Default: "interpolateBlues"
     * @param {string} type - type of the scale. Possbile values: "sequential", "linear".
     * @returns {(function|object)} - returns both the scale function and a legend with value/color-pairs for visualization.
     */

    generateColorScale (values = [0, 1], colorspace = "interpolateBlues", legendSteps = 5, type = "sequential", defaultColor = "rgb(51, 153, 204)") {
        const legendDefaultColor = "rgb(99,99,99)",
            filteredValues = values.filter(val => !isNaN(val)),
            filteredUndefineds = values.filter(val => val === undefined),
            minValue = Math.min(...filteredValues),
            maxValue = Math.max(...filteredValues);

        let scale,
            legend = {
                values: [],
                colors: []
            };

        // Check if more than one value has been submitted
        if (minValue !== maxValue && filteredValues.length > 0) {
            switch (type) {
                case "linear":
                    scale = scaleLinear()
                        .range(typeof colorspace === "string" ? Chromatic[colorspace] : colorspace)
                        .domain([minValue, maxValue]);
                    break;
                default:
                    scale = scaleSequential()
                        .interpolator(typeof colorspace === "string" ? Chromatic[colorspace] : colorspace)
                        .domain([minValue, maxValue]);
                    break;
            }

            legend.values = this.interpolateValues(minValue, maxValue, legendSteps);
            legend.colors = this.createLegendValues(scale, legend.values);
            if (filteredUndefineds.length > 0) {
                legend.values.push("Keine Daten");
                legend.colors.push(legendDefaultColor);
            }
        }

        // return default color if not
        else if (values.length !== filteredUndefineds.length) {
            scale = function () {
                return defaultColor;
            };
            legend = null;
        }
        else if (values.length === filteredUndefineds.length) {
            scale = function () {
                return legendDefaultColor;
            };
            legend.values.push("Keine Daten");
            legend.colors.push(legendDefaultColor);
        }

        return {scale, legend};
    },

    /**
     * calculates the values for the legend using the min and max values and the number of steps
     * @param {number} min - min value
     * @param {number} max - max value
     * @param {number} steps - number of steps
     * @return {number[]} calculated values
     */
    interpolateValues: function (min, max, steps = 5) {
        const values = [min],
            step = (max - min) / (steps - 1);

        for (let i = 0; i < steps - 1; i++) {
            values.push(values[i] + step);
        }

        return values;
    },

    /**
     * gets the rgbs for the corresponding values
     * @param {object} scale - d3 scale
     * @param {number[]} values - legend values
     * @returns {string[]} array of rgbs
     */
    createLegendValues: function (scale, values) {
        const colors = [];

        values.forEach((val) => {
            colors.push(scale(val));
        });

        return colors;
    }
});

export default ColorScale;
