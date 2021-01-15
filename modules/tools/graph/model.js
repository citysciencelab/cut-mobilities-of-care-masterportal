import * as d3 from "d3";

const GraphModel = Backbone.Model.extend(/** @lends GraphModel.prototype */{
    defaults: {
        currentGraphConfig: null,
        localeFormatKeys: [
            "decimal",
            "thousands",
            "grouping",
            "currency",
            "dateTime",
            "date",
            "time",
            "periods",
            "days",
            "shortDays",
            "months",
            "shortMonths"
        ]
    },

    /**
     * @class GraphModel
     * @extends Backbone.Model
     * @memberof Tools.Graph
     * @constructs
     * @listens Tools.Graph#RadioTriggerGraphCreateGraph
     * @listens Tools.Graph#RadioRequestGraphGetGraphParams
     */
    initialize: function () {
        const channel = Radio.channel("Graph");

        channel.on({
            "createGraph": this.createGraph
        }, this);
        channel.reply({
            "getGraphParams": function () {
                return this.get("graphParams");
            }
        }, this);
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLanguage
        });

        this.changeLanguage(i18next.language);
    },

    /**
     * Switches d3 default locale.
     * @param {string} languageKey language to be set active
     * @returns {void}
     */
    changeLanguage: function (languageKey) {
        // may be called initially without language key; skip in that case
        if (languageKey) {
            const locales = this.get("localeFormatKeys").reduce((accumulator, current) => {
                accumulator[current] = i18next.t(`common:modules.tools.graph.localeFormat.${current}`, {returnObjects: true});
                return accumulator;
            }, {});

            d3.formatDefaultLocale(locales);
        }

        if (this.get("currentGraphConfig")) {
            this.createGraph(this.get("currentGraphConfig"));
        }
    },

    /**
     * Creates the graph. Distinguishes betweeen
     * graphConfig.graphType === "Linegraph" and
     * graphConfig.graphType === "BarGraph".
     * @param {Object} graphConfig Graph configuration.
     * @returns {Void}  -
     */
    createGraph: function (graphConfig) {
        const d3Div = d3.select(graphConfig.selector).nodes()[0];

        if (d3Div) {
            this.setCurrentGraphConfig(graphConfig);
            const translatedGraphConfig = this.translateGraphConfig(graphConfig);

            d3Div.innerHTML = "<div class=\"graph-tooltip-div\"></div>";

            if (translatedGraphConfig.graphType === "Linegraph") {
                this.createLineGraph(translatedGraphConfig);
            }
            else if (translatedGraphConfig.graphType === "BarGraph") {
                this.createBarGraph(translatedGraphConfig);
            }
            else {
                console.error(`Unknown graphType '${translatedGraphConfig.graphType}' in graph/model.js.`);
            }
        }
        else {
            this.setCurrentGraphConfig(null);
        }
    },

    /**
     * Translate function goes over all potentially to-be-translated strings and returns
     * a translated version of it without touching the original element.
     * @param {object} graphConfig graph configuration
     * @returns {object} graph configuration, but translated where entries were keys
     */
    translateGraphConfig: function (graphConfig) {
        // works in this case as clone deep
        const newConfig = JSON.parse(JSON.stringify(graphConfig));

        if (newConfig.legendData) {
            newConfig.legendData = graphConfig.legendData.map(data => {
                data.text = i18next.t(data.text);
                return data;
            });
        }

        if (newConfig.xAxisLabel) {
            newConfig.xAxisLabel.label = i18next.t(newConfig.xAxisLabel.label);
            newConfig.yAxisLabel.label = i18next.t(newConfig.yAxisLabel.label);
        }
        if (newConfig.xAxisTicks) {
            newConfig.xAxisTicks.unit = i18next.t(newConfig.xAxisTicks.unit);
        }

        return newConfig;
    },

    /**
     * searches for the minimum value overall values of data defined in attrToShowArray - note that this function is axis neutral
     * @param {Object[]} data the data for the graph - this is an array of objects for either Linegraph or BarGraph
     * @param {String[]} attrToShowArray as defined in graphConfig - an array of keys to find the data for the axis in
     * @returns {Number}  - the lowest figure for any key in attrToShowArray found in data
     */
    createMinValue: function (data, attrToShowArray) {
        let minPeak = 0;

        if (!Array.isArray(data) || !Array.isArray(attrToShowArray)) {
            return minPeak;
        }

        data.forEach(function (obj) {
            attrToShowArray.forEach(function (attrToShow) {
                if (obj[attrToShow] < minPeak) {
                    minPeak = obj[attrToShow];
                }
            });
        });

        return minPeak;
    },

    /**
     * searches for the maximum value overall values of data defined in attrToShowArray - note that this function is axis neutral
     * @param {Object[]} data the data for the graph - this is an array of objects for either Linegraph or BarGraph
     * @param {String[]} attrToShowArray as defined in graphConfig - an array of keys to find the data for the axis in
     * @returns {Number}  - the highest figure for any key in attrToShowArray found in data
     */
    createMaxValue: function (data, attrToShowArray) {
        let maxPeak = 0;

        if (!Array.isArray(data) || !Array.isArray(attrToShowArray)) {
            return maxPeak;
        }

        data.forEach(function (obj) {
            attrToShowArray.forEach(function (attrToShow) {
                if (obj[attrToShow] > maxPeak) {
                    maxPeak = obj[attrToShow];
                }
            });
        });

        return maxPeak;
    },

    /**
     * gets an object with global the minimum and maximum values (peaks) of data defined in attrToShowArray - note that this function is axis neutral
     * @param {Object[]} data the data for the graph - this is an array of objects for either Linegraph or BarGraph
     * @param {String[]} attrToShowArray as defined in graphConfig - an array of keys to find the data for the y axis in
     * @param {Object} [axisTicks] (optional) as defined in graphConfig - used to force start and end of an axis when axisTicks.start and axisTicks.end is given. Otherwise automatic lookup of start and end point will be triggered.
     * @returns {Object}  - an object {minValue, maxValue}
     */
    createPeakValues: function (data, attrToShowArray, axisTicks) {
        const peakValues = {};

        if (typeof axisTicks === "object" && axisTicks.hasOwnProperty("start") && axisTicks.hasOwnProperty("end")) {
            peakValues.min = axisTicks.start;
            peakValues.max = axisTicks.end;
        }
        else {
            peakValues.min = this.createMinValue(data, attrToShowArray);
            peakValues.max = this.createMaxValue(data, attrToShowArray);
        }

        return peakValues;
    },

    /**
     * creates a d3 scale for the x axis - in general a d3 scale is a function to translate a value into pixels to adjust dom objects in the diagram
     * @param {Object[]} data the data for the graph - this is an array of objects for either Linegraph or BarGraph
     * @param {Number} width as defined in graphConfig - the width in pixel to draw the diagram in (note: a margin should be calculated out of width at this point already)
     * @param {String} scaleTypeX as defined in graphConfig - should be "ordinal" or "linear"
     * @param {String} xAttr as defined in graphConfig - the key for x-axis data to be found in data
     * @param {Object} [xAxisTicks] (optional) as defined in graphConfig - if not given automatic processing will take place
     * @returns {Function}  - a function "pixels := function(value)" to translate a value from data into pixels from left to right of the diagram
     */
    createScaleX: function (data, width, scaleTypeX, xAttr, xAxisTicks) {
        const rangeArray = [0, width];
        let scale,
            peak;

        if (scaleTypeX === "ordinal") {
            // note: as createPeakValues is axis neutral the String xAttr has to be translated into an Array(String) to match the structure of an attrToShowArray
            scale = this.createOrdinalScale(data, rangeArray, [xAttr]);
        }
        else if (scaleTypeX === "linear") {
            // note: as createPeakValues is axis neutral the String xAttr has to be translated into an Array(String) to match the structure of an attrToShowArray
            peak = this.createPeakValues(data, [xAttr], xAxisTicks);
            scale = this.createLinearScale(peak.min, peak.max, rangeArray);
        }
        else {
            console.error("Unknown graphConfig.scaleTypeX", scaleTypeX);
        }

        return scale;
    },

    /**
     * creates a d3 scale for the y axis - in general a d3 scale is a function to translate a value into pixels to adjust dom objects in the diagram
     * @param {Object[]} data the data for the graph - this is an array of objects for either Linegraph or BarGraph
     * @param {Number} height as defined in graphConfig - the height in pixel to draw the diagram in (note: a margin should be calculated out of height at this point already)
     * @param {String} scaleTypeY as defined in graphConfig - should be "ordinal" or "linear"
     * @param {String[]} attrToShowArray as defined in graphConfig - an array of keys to find the data for the y axis in
     * @param {Object} [yAxisTicks] (optional) as defined in graphConfig - if not given automatic processing will take place
     * @returns {Function}  - a function "pixels := function(value)" to translate a value from data into pixels from top to bottom of the diagram
     */
    createScaleY: function (data, height, scaleTypeY, attrToShowArray, yAxisTicks) {
        const rangeArray = [height, 0];
        let scale,
            peak;

        if (scaleTypeY === "ordinal") {
            scale = this.createOrdinalScale(data, rangeArray, attrToShowArray);
        }
        else if (scaleTypeY === "linear") {
            peak = this.createPeakValues(data, attrToShowArray, yAxisTicks);
            scale = this.createLinearScale(peak.min, peak.max, rangeArray);
        }
        else {
            console.error("Unknown graphConfig.scaleTypeY " + scaleTypeY);
        }

        return scale;
    },

    /**
     * creates an ordinal d3 scale function
     * @param {Object[]} data the data for the graph
     * @param {Number[]} rangeArray a simple array [maxPixel, minPixel] defining the diagrams range in pixel (e.g. [height, 0])
     * @param {String[]} attrArray as defined in graphConfig.xAttr respectively graphConfig.attrToShowArray
     * @returns {Function}  - a ordinal d3 scale function to translate values into pixel
     */
    createOrdinalScale: function (data, rangeArray, attrArray) {
        const values = [],
            known = {};
        let rArray = rangeArray;

        if (rArray === undefined || rArray === null) {
            // using d3 .range function with parameter undefined or null would throw an error
            // this fixes .range not to quit with an error
            rArray = [rArray];
        }

        if (Array.isArray(data) && Array.isArray(attrArray)) {
            data.forEach(function (atom) {
                attrArray.forEach(function (attr) {
                    if (!atom || !atom.hasOwnProperty(attr) || known.hasOwnProperty(atom[attr])) {
                        return;
                    }
                    values.push(atom[attr]);
                    known[atom[attr]] = true;
                });
            });
        }

        return d3.scaleBand()
            .range(rArray)
            .domain(values);
    },

    /**
     * creates a linear d3 scale function
     * @param {Number} minValue min value (from data) for the linear scale
     * @param {Number} maxValue max value (from data) for the linear scale
     * @param {Number[]} rangeArray a simple array [maxPixel, minPixel] defining the diagrams range in pixel (e.g. [height, 0])
     * @returns {Function}  - a linear d3 scale function to translate values into pixel
     */
    createLinearScale: function (minValue, maxValue, rangeArray) {
        let rArray = rangeArray;

        if (rArray === undefined || rArray === null) {
            // using d3 .range function with parameter undefined or null would throw an error
            // this fixes .range not to quit with an error
            rArray = [rArray];
        }

        return d3.scaleLinear()
            .range(rArray)
            .domain([minValue, maxValue])
            .nice();
    },

    /**
     * Creates the bottom axis of the graph.
     * @param {Object} scale Scale of bottom axis.
     * @param {Object} xAxisTicks Ticks for bottom axis.
     * @returns {Object}  - axisBottom
     */
    createAxisBottom: function (scale, xAxisTicks) {
        const unit = xAxisTicks && xAxisTicks.hasOwnProperty("unit") ? " " + xAxisTicks.unit : "";
        let d3Object;

        if (xAxisTicks === undefined) {
            d3Object = d3.axisBottom(scale);
        }
        else if (xAxisTicks.hasOwnProperty("values") && !xAxisTicks.hasOwnProperty("factor")) {
            d3Object = d3.axisBottom(scale)
                .tickValues(xAxisTicks.values)
                .tickFormat(function (d) {
                    return d + unit;
                });
        }
        else if (xAxisTicks.hasOwnProperty("values") && xAxisTicks.hasOwnProperty("factor")) {
            d3Object = d3.axisBottom(scale)
                .ticks(xAxisTicks.values, xAxisTicks.factor)
                .tickFormat(function (d) {
                    return d + unit;
                });
        }

        return d3Object;
    },

    /**
     * Creates the axis on the left.
     * @param {Object} scale Scale of left axis.
     * @param {Object} yAxisTicks Ticks for left axis.
     * @returns {Object}  - axisLeft
     */
    createAxisLeft: function (scale, yAxisTicks) {
        let d3Object;

        if (yAxisTicks && yAxisTicks.hasOwnProperty("ticks") && yAxisTicks.hasOwnProperty("factor")) {
            d3Object = d3.axisLeft(scale)
                .ticks(yAxisTicks.ticks, yAxisTicks.factor);
        }
        else {
            d3Object = d3.axisLeft(scale)
                .tickFormat(function (d) {
                    if (d % 1 === 0) {
                        return d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                    }
                    return false;

                });
        }

        return d3Object;
    },

    /**
     * Creates a d3 line object.
     * @param {Object} scaleX Scale of x-axis.
     * @param {Object} scaleY Scale of y-axis.
     * @param {String} xAttr  Attribute name for x-axis.
     * @param {string} yAttrToShow Attribut name for y-axis.
     * @returns {Object}  - valueLine.
     */
    createValueLine: function (scaleX, scaleY, xAttr, yAttrToShow) {
        return d3.line()
            .x(function (d) {
                return scaleX(d[xAttr]) + (scaleX.bandwidth() / 2);
            })
            .y(function (d) {
                return scaleY(d[yAttrToShow]);
            })
            .defined(function (d) {
                return !isNaN(d[yAttrToShow]);
            });
    },

    /**
     * Creates the basic structure of a graph.
     * @param {SVG} svg The svg.
     * @param {Object[]} [data=[]] Data for graph.
     * @param {String} className Class name of point.
     * @param {Object} d3line D3 line object.
     * @param {Number} legendHeight height for the legend in px, if not available it is calculated by bbox
     * @returns {void}
     */
    appendDataToSvg: function (svg, data = [], className, d3line, legendHeight) {
        const dataToAdd = data.filter(obj => {
            return obj.yAttrToShow !== "-";
        });

        svg.append("g")
            .attr("class", "graph-data")
            .attr("transform", function () {
                let y;

                if (svg.select(".graph-legend").size() > 0) {
                    y = svg.select(".graph-legend").node().getBBox().height;
                    if (y === 0 && legendHeight) {
                        y = legendHeight;
                    }
                    return "translate(0, " + y + ")";
                }
                return "translate(0, 0)";
            })
            .append("g")
            .attr("class", "graph-diagram")
            .append("path")
            .data([dataToAdd])
            .attr("class", className)
            .attr("d", d3line);
    },

    /**
     * Appends the x-axis to the svg.
     * @param {SVG} svg SVG.
     * @param {Object} xAxis x-axis.
     * @param {Object} xAxisLabel Definition of x-axis.
     * @param {String} [xAxisLabel.label] Text of label.
     * @param {String} [xAxisLabel.offset=0] Offset between x-axis and text.
     * @param {String} [xAxisLabel.textAnchor=middle] Text anchor of x-axis label.
     * @param {String} [xAxisLabel.fill=#000] Text fill color.
     * @param {String} [xAxisLabel.fontSize=10] Text font size.
     * @param {Number} width Width of SVG.
     * @param {Function} y y(value) transitions data value into pixel from top
     * @returns {Void}  -
     */
    appendXAxisToSvg: function (svg, xAxis, xAxisLabel, width, y) {
        const textOffset = xAxisLabel.offset !== undefined ? xAxisLabel.offset : 0,
            textAnchor = xAxisLabel.textAnchor !== undefined ? xAxisLabel.textAnchor : "middle",
            fill = xAxisLabel.fill !== undefined ? xAxisLabel.fill : "#000",
            fontSize = xAxisLabel.fontSize !== undefined ? xAxisLabel.fontSize : 10,
            label = xAxisLabel.label !== undefined ? [xAxisLabel.label] : null;
        let xAxisDraw = xAxis;

        xAxisDraw = svg.select(".graph-data").selectAll("yAxisDraw")
            .data([1]) // setze ein Dummy-Array mit Länge 1 damit genau einmal die Achse appended wird
            .enter()
            .append("g")
            .attr("transform", function () {
                // positioning the x-axis at y zero
                return "translate(0," + y(0) + ")";
            })
            .attr("class", "xAxisDraw")
            .call(xAxisDraw);

        if (label) {
            xAxisDraw.append("text")
                .attr("x", width / 2)
                .attr("y", 18 + textOffset)
                .attr("dy", "1em")
                .style("text-anchor", textAnchor)
                .style("fill", fill)
                .style("font-size", fontSize)
                .text(label)
                .attr("class", "xAxisLabelText");
        }
    },

    /**
     * Appends the y-axis to the svg
     * @param {SVG} svg SVG.
     * @param {Object} yAxis y-axis.
     * @param {Object} yAxisLabel Definition of y-axis.
     * @param {String} [yAxisLabel.label] Text of label.
     * @param {String} [yAxisLabel.offset=0] Offset between y-axis and text.
     * @param {String} [yAxisLabel.textAnchor=middle] Text anchor of y-axis label.
     * @param {String} [yAxisLabel.fill=#000] Text fill color.
     * @param {String} [yAxisLabel.fontSize=10] Text font size.
     * @param {Number} height Height of SVG.
     * @returns {Void}  -
     */
    appendYAxisToSvg: function (svg, yAxis, yAxisLabel, height) {
        const textOffset = yAxisLabel.offset !== undefined ? yAxisLabel.offset : 0,
            textAnchor = yAxisLabel.textAnchor !== undefined ? yAxisLabel.textAnchor : "middle",
            fill = yAxisLabel.fill !== undefined ? yAxisLabel.fill : "#000",
            fontSize = yAxisLabel.fontSize !== undefined ? yAxisLabel.fontSize : 10,
            label = yAxisLabel.label !== undefined ? [yAxisLabel.label] : null;
        let yAxisDraw = yAxis;

        yAxisDraw = svg.select(".graph-data").selectAll("yAxisDraw")
            .data([1]) // setze ein Dummy-Array mit Länge 1 damit genau einmal die Achse appended wird
            .enter()
            .append("g")
            .attr("class", "yAxisDraw")
            .call(yAxisDraw);

        if (label) {
            yAxisDraw.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", 0 - (height / 2))
                .attr("y", 0 - textOffset)
                .attr("dy", "1em")
                .style("text-anchor", textAnchor)
                .style("fill", fill)
                .style("font-size", fontSize)
                .text(label);
        }
    },

    /**
     * Appends line points to created line.
     * @param {SVG} svg Svg.
     * @param {Object[]} [data=[]] Data for graph.
     * @param {Object} scaleX Scale for x-axis.
     * @param {Object} scaleY Scale for y-axis.
     * @param {String} xAttr Attribute name for x-axis.
     * @param {String} yAttrToShow Attribute name for line point on y-axis.
     * @param {Selection} tooltipDiv Selection of the tooltip-div.
     * @param {Number} dotSize The size of the dots.
     * @param {Function} [setTooltipValue] (optional) a function value:=function(value, xAxisAttr) to set/convert the tooltip value that is shown hovering a point - if not set or left undefined: default is >(...).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")< due to historic reasons
     * @returns {Void}  -
     */
    appendLinePointsToSvg: function (svg, data = [], scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv, dotSize, setTooltipValue) {
        const dat = data.filter(function (obj) {
                return obj[yAttrToShow] !== undefined && obj[yAttrToShow] !== "-";
            }),
            // event.layerX / event.offsetX differ in FF and Chrome. Thats why we must adjust this here.
            isChrome = Radio.request("Util", "isChrome"),
            chromeOffsetX = isChrome ? 0 : 70,
            chromeOffsetY = isChrome ? -35 : -15;

        let yAttributeToShow;

        svg.select(".graph-diagram").selectAll("points")
            .data(dat)
            .enter()
            .append(function (d) {
                return document.createElementNS("http://www.w3.org/2000/svg", d.style);
            })
            .attr("cx", function (d) {
                return scaleX(d[xAttr]) + (scaleX.bandwidth() / 2);
            })
            .attr("cy", function (d) {
                return scaleY(d[yAttrToShow]);
            })
            .attr("r", dotSize)

            .attr("x", function (d) {
                return scaleX(d[xAttr]) + (scaleX.bandwidth() / 2);
            })
            .attr("y", function (d) {
                return scaleY(d[yAttrToShow]) - 5;
            })
            .attr("width", 10)
            .attr("height", 10)
            .attr("class", function (d) {
                return d.class;
            })
            .attr("attrname", yAttrToShow)
            .attr("attrval", function (d) {
                return d[yAttrToShow];
            })
            .on("mouseover", function (d) {
                if (typeof setTooltipValue === "function") {
                    yAttributeToShow = setTooltipValue(d[yAttrToShow], d);
                }
                else {
                    yAttributeToShow = d[yAttrToShow].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                }
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(yAttributeToShow)
                    .attr("style", "background-color: buttonface; border-radius: 4px; text-align: center;")
                    .style("left", (event.layerX + chromeOffsetX) + "px")
                    .style("top", (event.layerY + chromeOffsetY) + "px");
            }, tooltipDiv)
            .on("mouseout", function () {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0)
                    .on("end", function () {
                        tooltipDiv.style("left", "0px");
                        tooltipDiv.style("top", "0px");
                    }, tooltipDiv);
            }, tooltipDiv)
            .on("click", function (d) {
                if (typeof setTooltipValue === "function") {
                    yAttributeToShow = setTooltipValue(d[yAttrToShow], d);
                }
                else {
                    yAttributeToShow = d[yAttrToShow].toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                }
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(yAttributeToShow)
                    .attr("style", "background-color: buttonface; border-radius: 4px;")
                    .style("left", (event.layerX + chromeOffsetX) + "px")
                    .style("top", (event.layerY + chromeOffsetY) + "px");
            }, tooltipDiv);
    },

    /**
     * Creates the SVG.
     * @param {String} selector Class of DOM element where svg gets appended.
     * @param {Number} left Left border of SVG.
     * @param {Number} top Right border of SVG.
     * @param {Number} width Width of SVG.
     * @param {Number} height Height of SVG.
     * @param {String} svgClass Class of SVG.
     * @returns {SVG} - SVG
     */
    createSvg: function (selector, left, top, width, height, svgClass) {
        return d3.select(selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", svgClass)
            .append("g")
            .attr("class", "graph")
            .attr("transform", "translate(" + left + "," + top + ")");
    },

    /**
     * Creates a legend and adds it on the top left.
     * @param {SVG} svg SVG.
     * @param {Object[]} legendData Legend object.
     * @param {String} legendData.style Type of legend item "rect" for "<rect>" or "circle" for "<circle>".
     * @param {String} legendData.class Class of legend item.
     * @param {String} legendData.text Text of legend item.
     * @returns {Void}  -
     */
    appendLegend: function (svg, legendData) {
        const legend = svg.append("g")
            .attr("class", "graph-legend")
            .style("height", "200 px")
            .selectAll("g")
            .data(legendData)
            .enter()
            .append("g")
            .attr("class", "graph-legend-item")
            .attr("transform", function (d, i) {
                return "translate(" + -60 + "," + (-20 + (20 * i)) + ")";
            });

        legend.append(function (d) {
            return document.createElementNS("http://www.w3.org/2000/svg", d.style);
        })
            // Attribute für <rect>
            .attr("width", 10)
            .attr("height", 10)
            .attr("x", 0)
            .attr("y", 5)
            // Attribute für <circle>
            .attr("cx", 5)
            .attr("cy", 10)
            .attr("r", 5)
            .attr("class", function (d) {
                return d.class;
            });

        legend.append("text")
            .attr("x", 20)
            .attr("y", 15)
            .text(function (d) {
                return d.text;
            });
    },

    /**
     * Flattens the attributeToShowArray and only returns an array of the attrNames.
     * @param {Object/String[]} attrToShowArray Array of objects or strings.
     * @returns {String[]} - Flattened Array.
     */
    flattenAttrToShowArray: function (attrToShowArray) {
        const flatAttrToShowArray = [];

        attrToShowArray.forEach(function (attrToShow) {
            if (typeof attrToShow === "object") {
                flatAttrToShowArray.push(attrToShow.attrName);
            }
            else {
                flatAttrToShowArray.push(attrToShow);
            }
        });

        return flatAttrToShowArray;
    },

    /**
     * Creates the Linegraph.
     * @param {Object} graphConfig Graph config.
     * @param {String} graphConfig.selector Class for SVG to be appended to.
     * @param {String} graphConfig.scaleTypeX Type of x-axis.
     * @param {String} graphConfig.scaleTypeY Type of y-axis.
     * @param {Object[]} graphConfig.data Data for graph.
     * @param {String} graphConfig.xAttr Attribute name for x-axis.
     * @param {Object} graphConfig.xAxisLabel Object to define the label for x-axis.
     * @param {String} graphConfig.xAxisLabel.label Label for x-axis; may be a locale key.
     * @param {Number} graphConfig.xAxisLabel.translate Translation offset for label for x-axis.
     * @param {Object} graphConfig.yAxisLabel Object to define the label for y-axis.
     * @param {String} graphConfig.yAxisLabel.label Label for y-axis; may be a locale key.
     * @param {Number} graphConfig.yAxisLabel.offset Offset for label for y-axis.
     * @param {Object/String[]} graphConfig.attrToShowArray Array of attribute names or objects to be shown on y-axis.
     * @param {Object/String[]} graphConfig.attrToShowArray.attrName Name of attribute to be shown.
     * @param {Object/String[]} graphConfig.attrToShowArray.attrClass Class for line in graph.
     * @param {Object} graphConfig.margin Margin object for graph.
     * @param {Number} graphConfig.margin.top Top margin.
     * @param {Number} graphConfig.margin.right Right margin.
     * @param {Number} graphConfig.margin.bottom Bottom margin.
     * @param {Number} graphConfig.margin.left left margin.
     * @param {Number} graphConfig.width Width of SVG.
     * @param {Number} graphConfig.height Height of SVG.
     * @param {Object} graphConfig.xAxisTicks Ticks for x-axis.
     * @param {String} graphConfig.xAxisTicks.unit Unit of x-axis-ticks; may be a locale key.
     * @param {Number/String[]} graphConfig.xAxisTicks.values Values for x-axis-ticks.
     * @param {Number} graphConfig.xAxisTicks.factor Factor for x-axis-ticks.
     * @param {Object} graphConfig.yAxisTicks Ticks for y-axis.
     * @param {Object} graphConfig.yAxisTicks.ticks Values for y-axis-ticks.
     * @param {Object} graphConfig.yAxisTicks.factor Factor for y-axis-ticks.
     * @param {String} graphConfig.svgClass Class of SVG.
     * @param {String} graphConfig.selectorTooltip Selector for tooltip div.
     * @param {Object[]} graphConfig.legendData Data for legend.
     * @param {String} graphConfig.legendData.class CSS class for legend object.
     * @param {String} graphConfig.legendData.text Text for legend object; may be a locale key.
     * @param {Function} graphConfig.setTooltipValue an optional function value:=function(value, xAxisAttr) to set/convert the tooltip value that is shown hovering a point - if not set or left undefined: default is >(...).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".")< due to historic reasons
     * @returns {Void}  -
     */
    createLineGraph: function (graphConfig) {
        const isMobile = Radio.request("Util", "isViewMobile"),
            selector = graphConfig.selector,
            scaleTypeX = graphConfig.scaleTypeX,
            scaleTypeY = graphConfig.scaleTypeY,
            data = graphConfig.data,
            xAttr = graphConfig.xAttr,
            xAxisLabel = graphConfig.xAxisLabel,
            yAxisLabel = graphConfig.yAxisLabel,
            attrToShowArray = graphConfig.attrToShowArray,
            flatAttrToShowArray = this.flattenAttrToShowArray(attrToShowArray),
            margin = graphConfig.margin,
            marginBottom = isMobile ? margin.bottom + 20 : margin.bottom,
            width = graphConfig.width - margin.left - margin.right,
            height = graphConfig.height - margin.top - marginBottom,
            scaleX = this.createScaleX(data, width, scaleTypeX, xAttr),
            scaleY = this.createScaleY(data, height, scaleTypeY, flatAttrToShowArray),
            xAxisTicks = graphConfig.xAxisTicks,
            yAxisTicks = graphConfig.yAxisTicks,
            xAxis = this.createAxisBottom(scaleX, xAxisTicks),
            yAxis = this.createAxisLeft(scaleY, yAxisTicks),
            svgClass = graphConfig.svgClass,
            svg = this.createSvg(selector, margin.left, margin.top, graphConfig.width, graphConfig.height, svgClass),
            tooltipDiv = d3.select(graphConfig.selectorTooltip),
            offset = 10,
            dotSize = graphConfig.dotSize || 5,
            setTooltipValue = graphConfig.setTooltipValue;
        let valueLine;

        if (graphConfig.hasOwnProperty("legendData")) {
            this.appendLegend(svg, graphConfig.legendData);
        }

        attrToShowArray.forEach(function (yAttrToShow) {
            if (typeof yAttrToShow === "object") {
                valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow.attrName);
                this.appendDataToSvg(svg, data, yAttrToShow.attrClass, valueLine, graphConfig.legendHeight);
                // Add the scatterplot for each point in line
                this.appendLinePointsToSvg(svg, data, scaleX, scaleY, xAttr, yAttrToShow.attrName, tooltipDiv, dotSize, setTooltipValue);
            }
            else {
                valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow);
                this.appendDataToSvg(svg, data, "line", valueLine, graphConfig.legendHeight);
                // Add the scatterplot for each point in line
                this.appendLinePointsToSvg(svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv, dotSize, setTooltipValue);
            }
        }, this);

        // Add the Axis
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel, height);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel, width, scaleY);

        if (isMobile) {
            this.rotateXAxisTexts(svg);
            this.translateXAxislabelText(svg, xAxisLabel.translate);
        }

        this.setGraphParams({
            scaleX: scaleX,
            scaleY: scaleY,
            tooltipDiv: tooltipDiv,
            margin: margin,
            offset: offset
        });
    },

    /**
     * Rotates the label on the x-axis by 45 degrees
     * @param {SVG} svg SVG.
     * @returns {Void}  -
     */
    rotateXAxisTexts: function (svg) {
        svg.select(".xAxisDraw").selectAll(".tick").selectAll("text")
            .attr("transform", "rotate(45) translate(17, -4)");
    },

    /**
     * Moves the label of the x-axis downwards
     * @param {SVG} svg SVG.
     * @param {Number} xAxisLabelTranslate Translation on the x-axis.
     * @returns {Void}  -
     */
    translateXAxislabelText: function (svg, xAxisLabelTranslate) {
        svg.select(".xAxisDraw").selectAll(".xAxisLabelText")
            .attr("transform", "translate(0, " + xAxisLabelTranslate + ")");
    },

    /**
     * Creates the BarGraph
     * @param {Object} graphConfig Graph config.
     * @param {String} graphConfig.selector Class for SVG to be appended to.
     * @param {String} graphConfig.scaleTypeX Type of x-axis.
     * @param {String} graphConfig.scaleTypeY Type of y-axis.
     * @param {Object[]} graphConfig.data Data for graph.
     * @param {String} graphConfig.xAttr Attribute name for x-axis.
     * @param {Object} graphConfig.xAxisLabel Object to define the label for x-axis.
     * @param {String} graphConfig.xAxisLabel.label Label for x-axis; may be a locale key.
     * @param {Number} graphConfig.xAxisLabel.translate Translation offset for label for x-axis.
     * @param {Object} graphConfig.yAxisLabel Object to define the label for y-axis.
     * @param {String} graphConfig.yAxisLabel.label Label for y-axis; may be a locale key.
     * @param {Number} graphConfig.yAxisLabel.offset Offset for label for y-axis.
     * @param {String[]} graphConfig.attrToShowArray Array of attribute names to be shown on y-axis.
     * @param {Object} graphConfig.margin Margin object for graph.
     * @param {Number} graphConfig.margin.top Top margin.
     * @param {Number} graphConfig.margin.right Right margin.
     * @param {Number} graphConfig.margin.bottom Bottom margin.
     * @param {Number} graphConfig.margin.left left margin.
     * @param {Number} graphConfig.width Width of SVG.
     * @param {Number} graphConfig.height Height of SVG.
     * @param {Object} graphConfig.xAxisTicks Ticks for x-axis.
     * @param {String} graphConfig.xAxisTicks.unit Unit of x-axis-ticks; may be a locale key.
     * @param {Number/String[]} graphConfig.xAxisTicks.values Values for x-axis-ticks.
     * @param {Number} graphConfig.xAxisTicks.factor Factor for x-axis-ticks.
     * @param {Object} graphConfig.yAxisTicks Ticks for y-axis.
     * @param {Object} graphConfig.yAxisTicks.ticks Values for y-axis-ticks.
     * @param {Object} graphConfig.yAxisTicks.factor Factor for y-axis-ticks.
     * @param {String} graphConfig.svgClass Class of SVG.
     * @param {Object[]} graphConfig.legendData Data for legend.
     * @param {Number} graphConfig.legendHeight height of the legend.
     * @param {String} graphConfig.legendData.class CSS class for legend object.
     * @param {String} graphConfig.legendData.text Text for legend object; may be a locale key.
     * @param {Number} graphConfig.legendHeight height of the legend.
     * @param {Function} graphConfig.setTooltipValue an optional function value:=function(value, xAxisAttr) to set/convert the tooltip value that is shown hovering a bar - if not set or left undefined: default is >(Math.round(d[attrToShowArray[0]] * 1000) / 10) + " %"< due to historic reasons
     * @returns {Void}  -
     */
    createBarGraph: function (graphConfig) {
        const selector = graphConfig.selector,
            scaleTypeX = graphConfig.scaleTypeX,
            scaleTypeY = graphConfig.scaleTypeY,
            data = graphConfig.data,
            xAttr = graphConfig.xAttr,
            xAxisLabel = graphConfig.xAxisLabel ? graphConfig.xAxisLabel : undefined,
            yAxisLabel = graphConfig.yAxisLabel ? graphConfig.yAxisLabel : undefined,
            attrToShowArray = graphConfig.attrToShowArray,
            margin = graphConfig.margin,
            width = graphConfig.width - margin.left - margin.right,
            height = graphConfig.height - margin.top - margin.bottom,
            xAxisTicks = graphConfig.xAxisTicks,
            yAxisTicks = graphConfig.yAxisTicks,
            scaleX = this.createScaleX(data, width, scaleTypeX, xAttr, xAxisTicks),
            scaleY = this.createScaleY(data, height, scaleTypeY, attrToShowArray, yAxisTicks),
            svgClass = graphConfig.svgClass,
            barWidth = width / data.length,
            setTooltipValue = graphConfig.setTooltipValue,
            xAxis = this.createAxisBottom(scaleX, xAxisTicks),
            yAxis = this.createAxisLeft(scaleY, yAxisTicks),
            svg = this.createSvg(selector, margin.left, margin.top, graphConfig.width, graphConfig.height, svgClass);

        if (graphConfig.hasOwnProperty("legendData")) {
            this.appendLegend(svg, graphConfig.legendData);
        }

        this.drawBars(svg, data, scaleX, scaleY, selector, xAttr, attrToShowArray, barWidth, setTooltipValue);
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel, height);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel, width, scaleY);

    },

    /**
     * draws the bars into the svg using d3 functions
     * @param {SVG} svg the d3 svg object
     * @param {Object[]} dataToAdd the data for the bar graph as an array of objects [{ (xAttr): valueX, (attrToShowArray[0]): valueY}, ...] where xAttr and attrToShowArray[0] are keys defined in graphConfig
     * @param {Function} x the function to give the place of data value looking from left to right in pixel
     * @param {Function} y y(value) transitions data value into pixel from top
     * @param {String} selector as set in graphConfig - may be css class of the dom holding the graph
     * @param {String} xAttr as defined in graphConfig - the name of the key to address the valueX in dataToAdd
     * @param {String[]} attrToShowArray as defined in graphConfig - the array of keys to find the data of valueY in dataToAdd
     * @param {Number} barWidth the width of a single bar - note that if zero or negative, barWidth will be automatically set to 0
     * @param {Function} [setTooltipValue] (optional) a function value:=function(value, xAxisAttr) to set/convert the tooltip value that is shown hovering a bar - if not set or left undefined: default is >(Math.round(d[attrToShowArray[0]] * 1000) / 10) + " %"< due to historic reasons
     * @returns {Void}  -
     */
    drawBars: function (svg, dataToAdd, x, y, selector, xAttr, attrToShowArray, barWidth, setTooltipValue) {
        svg.append("g")
            .attr("class", "graph-data")
            .attr("transform", function () {
                let legendHeight;

                if (svg.select(".graph-legend").size() > 0) {
                    legendHeight = svg.select(".graph-legend").node().getBBox().height;

                    return "translate(0, " + legendHeight + ")";
                }
                return "translate(0, 0)";
            })
            .append("g")
            .attr("class", "graph-diagram");

        svg.select(".graph-diagram").selectAll("bars")
            .data(dataToAdd)
            .enter()
            .append("rect")
            .attr("class", "bar" + selector.split(".")[1])
            .attr("x", function (d) {
                return x(d[xAttr]);
            })
            .attr("y", function (d) {
                // "y" is the starting point of the bar in pixel from top (0 px) to bottom (height px)
                if (d[attrToShowArray[0]] < 0) {
                    // if the value is negative the y zero line is used as starting point of the bar
                    return y(0);
                }

                return y(d[attrToShowArray[0]]);
            })
            // need to be carefull with negative width
            .attr("width", barWidth > 0 ? barWidth - 1 : 0)
            .attr("height", function (d) {
                // "height" is the height of the bar graph
                if (d[attrToShowArray[0]] < 0) {
                    // for negative values only, y(value) is higher then y(0) so the difference is the bar height
                    return y(d[attrToShowArray[0]]) - y(0);
                }

                // the height of the bar is y(value) (the starting point of the bar) but only down to y(0)
                return y(0) - y(d[attrToShowArray[0]]);
            })
            .on("mouseover", function () {
                d3.select(this);
            }, this)
            .append("title")
            .text(function (d) {
                if (typeof setTooltipValue === "function") {
                    return setTooltipValue(d[attrToShowArray[0]], d);
                }

                // default
                return (Math.round(d[attrToShowArray[0]] * 1000) / 10) + " %";
            });
    },

    /**
     * Setter for attribute "graphParams".
     * @param {Object} value Graph params.
     * @returns {void}
     */
    setGraphParams: function (value) {
        this.set("graphParams", value);
    },

    /**
     * Setter for attribute "currentGraphConfig".
     * @param {Object} value currentGraphConfig
     * @returns {void}
     */
    setCurrentGraphConfig: function (value) {
        this.set("currentGraphConfig", value);
    }
});

export default GraphModel;
