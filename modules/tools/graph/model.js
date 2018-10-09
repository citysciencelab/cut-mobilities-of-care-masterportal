import {scaleBand, scaleLinear} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";
import {line} from "d3-shape";
import {select, event} from "d3-selection";

const GraphModel = Backbone.Model.extend({
    defaults: {},

    initialize: function () {
        var channel = Radio.channel("Graph");

        channel.on({
            "createGraph": this.createGraph
        }, this);
        channel.reply({
            "getGraphParams": function () {
                return this.get("graphParams");
            }
        }, this);
    },

    createGraph: function (graphConfig) {
        if (graphConfig.graphType === "Linegraph") {
            this.createLineGraph(graphConfig);
        }
        else if (graphConfig.graphType === "BarGraph") {
            this.createBarGraph(graphConfig);
        }
    },

    /**
     * searches the max value from data
     * @param {array} data - contains data to be draw
     * @param {array} attrToShowArray - attribute to be draw
     * @return {number} maxData
     */
    createMaxValue: function (data, attrToShowArray) {
        var value,
            maxData;

        _.each(attrToShowArray, function (attrToShow) {
            value = _.max(data, function (d) {
                return d[attrToShow];
            });
        });

        maxData = _.isUndefined(value) || !_.isObject(value) ? 1 : value[attrToShowArray[0]];

        return maxData;
    },

    /**
     * creates an object with min- and max-value
     * @param {array} data - contains data to be draw
     * @param {array} attrToShowArray - attribute to be draw
     * @param {object} axisTicks - number of ticks
     * @return {object} valueObj
     */
    createValues: function (data, attrToShowArray, axisTicks) {
        var valueObj = {};

        if (!_.isUndefined(axisTicks) && _.has(axisTicks, "start") && _.has(axisTicks, "end")) {
            valueObj.minValue = axisTicks.start;
            valueObj.maxValue = axisTicks.end;
        }
        else {
            valueObj.minValue = 0;
            valueObj.maxValue = this.createMaxValue(data, attrToShowArray);
        }

        return valueObj;
    },

    createScaleX: function (data, size, scaletype, attr, xAxisTicks) {
        var rangeArray = [0, size],
            scale,
            valueObj;

        if (scaletype === "ordinal") {
            scale = this.createOrdinalScale(data, rangeArray, [attr]);
        }
        else if (scaletype === "linear") {
            valueObj = this.createValues(data, [attr], xAxisTicks);
            scale = this.createLinearScale(valueObj.minValue, valueObj.maxValue, rangeArray);
        }
        else {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Scaletype not found</strong>",
                kategorie: "alert-danger"
            });
        }
        return scale;
    },

    createScaleY: function (data, size, scaletype, attrToShowArray, yAxisTicks) {
        var rangeArray = [size, 0],
            scale,
            valueObj;

        if (scaletype === "ordinal") {
            scale = this.createOrdinalScale(data, rangeArray, attrToShowArray);
        }
        else if (scaletype === "linear") {
            valueObj = this.createValues(data, attrToShowArray, yAxisTicks);
            scale = this.createLinearScale(valueObj.minValue, valueObj.maxValue, rangeArray);
        }
        else {
            Radio.trigger("Alert", "alert", {
                text: "<strong>Scaletype not found</strong>",
                kategorie: "alert-danger"
            });
        }

        return scale;
    },

    createOrdinalScale: function (data, rangeArray, attrArray) {
        var values = [];

        _.each(data, function (d) {
            _.each(attrArray, function (attr) {
                values.push(d[attr]);
            });
        });
        values = _.uniq(values);
        // values.sort(); Sortierung nach String funktioniert nicht für timestamp, daher auskommentiert und Daten vorsortiert
        return scaleBand()
            .range(rangeArray)
            .domain(values);
    },

    createLinearScale: function (minValue, maxValue, rangeArray) {
        return scaleLinear()
            .range(rangeArray)
            .domain([minValue, maxValue])
            .nice();
    },


    createAxisBottom: function (scale, xThinningFactor, xAxisTicks) {
        var unit = !_.has(xAxisTicks, "unit") ? "" : " " + xAxisTicks.unit,
            d3Object;

        if (_.isUndefined(xAxisTicks) || !_.has(xAxisTicks, "ticks")) {
            d3Object = _.isUndefined(scale) ? undefined : axisBottom(scale)
                .tickValues(scale.domain().filter(function (d, i) {
                    var val = i % xThinningFactor;

                    return !val;
                }))

                .tickFormat(function (d) {
                    return d + unit;
                });
        }
        else {
            d3Object = axisBottom(scale)
                .ticks(xAxisTicks.ticks, xAxisTicks.factor)

                .tickFormat(function (d) {
                    return d + unit;
                });
        }

        return d3Object;
    },

    // create leftAxis. if separator === true (for yAxis), then set thousands-separator "."
    createAxisLeft: function (scale, yAxisTicks) {
        var d3Object;

        if (_.isUndefined(yAxisTicks) && !_.has(yAxisTicks, "ticks")) {
            d3Object = axisLeft(scale)
                .tickFormat(function (d) {
                    return d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                });
        }
        else {
            d3Object = axisLeft(scale).ticks(yAxisTicks.ticks, yAxisTicks.factor);
        }

        return d3Object;
    },

    createValueLine: function (scaleX, scaleY, xAttr, yAttrToShow, offset) {
        return line()
            .x(function (d) {
                return scaleX(d[xAttr]) + (offset + (scaleX.bandwidth() / 2));
            })
            .y(function (d) {
                return scaleY(d[yAttrToShow]);
            })
            .defined(function (d) {
                return !isNaN(d[yAttrToShow]);
            });
    },

    appendDataToSvg: function (svg, data, className, object) {
        var dataToAdd = _.filter(data, function (obj) {
            return obj.yAttrToShow !== "-";
        });

        svg.append("path")
            .data([dataToAdd])
            .attr("class", className)
            .attr("transform", "translate(0, 20)")
            .attr("d", object);
    },

    appendXAxisToSvg: function (svg, xAxis, xAxisLabel, AxisOffset, marginTop, height) {
        var svgBBox = svg.node().getBBox(),
            text = _.isUndefined(xAxisLabel.label) ? xAxisLabel : xAxisLabel.label,
            textOffset = _.isUndefined(xAxisLabel.offset) ? 0 : xAxisLabel.offset,
            textAnchor = _.isUndefined(xAxisLabel.textAnchor) ? "middle" : xAxisLabel.textAnchor,
            fill = _.isUndefined(xAxisLabel.fill) ? "#000" : xAxisLabel.fill,
            fontSize = _.isUndefined(xAxisLabel.fontSize) ? 10 : xAxisLabel.fontSize,
            heightDraw = _.isUndefined(height) ? svgBBox.height - marginTop : height,
            xAxisDraw = xAxis,
            xAxisBBox;

        xAxisDraw = svg.append("g")
            .attr("transform", "translate(" + AxisOffset + "," + heightDraw + ")")
            .attr("class", "xAxisDraw")
            .call(xAxis);
        xAxisBBox = svg.selectAll(".xAxisDraw").node().getBBox();

        // text for xAxisDraw
        xAxisDraw.append("text")
            .attr("x", xAxisBBox.width / 2)
            .attr("y", xAxisBBox.height + textOffset + 10)
            .style("text-anchor", textAnchor)
            .style("fill", fill)
            .style("font-size", fontSize)
            .text(text);
    },

    appendYAxisToSvg: function (svg, yAxis, yAxisLabel, textOffset, AxisOffset) {
        var yAxisDraw = yAxis,
            yAxisBBox;

        yAxisDraw = svg.append("g")
            .attr("transform", "translate(0, " + AxisOffset + ")")
            .attr("class", "yAxisDraw")
            .call(yAxisDraw);
        yAxisBBox = svg.selectAll(".yAxisDraw").node().getBBox();

        // text for yAxis
        yAxisDraw.append("text")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (yAxisBBox.height / 2))
            .attr("y", 0 - yAxisBBox.width - (2 * textOffset))
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .style("fill", "#000")
            .text(yAxisLabel);
    },

    appendLinePointsToSvg: function (svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv, offset) {
        var dat = _.filter(data, function (obj) {
            return obj[yAttrToShow] !== "-";
        });

        svg.selectAll("dot")
            .data(dat)
            .enter().append("circle")
            .attr("transform", "translate(0, 20)")
            .attr("cx", function (d) {
                return scaleX(d[xAttr]) + (offset + (scaleX.bandwidth() / 2));
            })
            .attr("cy", function (d) {
                return scaleY(d[yAttrToShow]);
            })
            .attr("r", 5)
            .attr("class", "dot")
            .on("mouseover", function (d) {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(d[yAttrToShow])
                    .attr("style", "background: gray")
                    .style("left", (event.offsetX + 5) + "px")
                    .style("top", (event.offsetY - 5) + "px");
            })
            .on("mouseout", function () {
                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", function () {
                        tooltipDiv.style("left", "0px");
                        tooltipDiv.style("top", "0px");
                    });
            })
            .on("click", function (d) {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(d[yAttrToShow])
                    .attr("style", "background: gray")
                    .style("left", (event.offsetX + 5) + "px")
                    .style("top", (event.offsetY - 5) + "px");
            });
    },

    createSvg: function (selector, marginObj, width, height, svgClass) {
        return select(selector).append("svg")
            .attr("width", width + marginObj.left + marginObj.right)
            .attr("height", height + marginObj.top + marginObj.bottom)
            .attr("class", svgClass)
            .append("g")
            .attr("transform", "translate(" + marginObj.left + "," + marginObj.top + ")");
    },

    appendLegend: function (svg, attrToShowArray, legendArray) {
        var legend = svg.append("g")
            .attr("class", "graph-legend")
            .selectAll("g")
            .data(this.getLegendTextArray(attrToShowArray, legendArray))
            .enter()
            .append("g")
            .attr("class", "graph-legend-item")
            .attr("transform", function () {
                return "translate(" + -60 + "," + -20 + ")";
            });

        legend.append("circle")
            .attr("cx", 5)
            .attr("cy", 10)
            .attr("r", 5)
            .attr("class", "dot");

        legend.append("text")
            .attr("x", 20)
            .attr("y", 15)
            .text(function (d) {
                return d;
            });
    },

    getLegendTextArray: function (attrArray, legendArray) {
        var valueArray = [];

        _.each(attrArray, function (attr) {
            var legendObj = _.find(legendArray, function (legend) {
                return legend.key === attr;
            });

            valueArray.push(legendObj.value);
        });

        return valueArray;
    },

    createLineGraph: function (graphConfig) {
        var selector = graphConfig.selector,
            scaleTypeX = graphConfig.scaleTypeX,
            scaleTypeY = graphConfig.scaleTypeY,
            data = graphConfig.data,
            xAttr = graphConfig.xAttr,
            xAxisLabel = graphConfig.xAxisLabel ? graphConfig.xAxisLabel : graphConfig.xAttr,
            yAxisLabel = graphConfig.yAxisLabel ? graphConfig.yAxisLabel : this.getLegendTextArray(graphConfig.attrToShowArray, graphConfig.legendArray),
            attrToShowArray = graphConfig.attrToShowArray,
            margin = {top: 20, right: 20, bottom: 70, left: 70},
            width = graphConfig.width - margin.left - margin.right,
            height = graphConfig.height - margin.top - margin.bottom,
            scaleX = this.createScaleX(data, width, scaleTypeX, xAttr),
            scaleY = this.createScaleY(data, height, scaleTypeY, attrToShowArray),
            valueLine,
            tooltipDiv = select(graphConfig.selectorTooltip),
            xThinning = graphConfig.xThinning ? graphConfig.xThinning : 1,
            xAxis = this.createAxisBottom(scaleX, xThinning),
            yAxis = this.createAxisLeft(scaleY),
            svg = this.createSvg(selector, margin, width, height, "graph-svg"),
            offset = 10;

        this.appendLegend(svg, attrToShowArray, graphConfig.legendArray);
        _.each(attrToShowArray, function (yAttrToShow) {

            valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow, offset);
            this.appendDataToSvg(svg, data, "line", valueLine);
            // Add the scatterplot for each point in line
            this.appendLinePointsToSvg(svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv, offset);
        }, this);
        // Add the Axis
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel, offset, 20);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel, offset, margin.top);

        this.setGraphParams({
            scaleX: scaleX,
            scaleY: scaleY,
            tooltipDiv: tooltipDiv,
            margin: margin,
            offset: offset
        });
    },

    createBarGraph: function (graphConfig) {
        // debugger;
        var selector = graphConfig.selector,
            margin = {top: 20, right: 20, bottom: 50, left: 50},
            width = graphConfig.width - margin.left - margin.right,
            height = graphConfig.height - margin.top - margin.bottom,
            scaleTypeX = graphConfig.scaleTypeX,
            scaleTypeY = graphConfig.scaleTypeY,
            svgClass = graphConfig.svgClass,
            data = graphConfig.data,
            xAttr = graphConfig.xAttr,
            attrToShowArray = graphConfig.attrToShowArray,
            xAxisLabel = graphConfig.xAxisLabel ? graphConfig.xAxisLabel : undefined,
            yAxisLabel = graphConfig.yAxisLabel ? graphConfig.yAxisLabel : undefined,
            xAxisTicks = graphConfig.xAxisTicks,
            yAxisTicks = graphConfig.yAxisTicks,
            svg = this.createSvg(selector, margin, width, height, svgClass),
            barWidth = width / data.length,
            scaleX = this.createScaleX(data, width, scaleTypeX, xAttr, xAxisTicks),
            scaleY = this.createScaleY(data, height, scaleTypeY, attrToShowArray, yAxisTicks),
            xAxis = this.createAxisBottom(scaleX, 1, xAxisTicks),
            yAxis = this.createAxisLeft(scaleY, yAxisTicks),
            offset = 0;

        this.drawBars(svg, data, scaleX, scaleY, height, selector, barWidth, xAttr, attrToShowArray);
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel, offset, 0);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel, offset, 0, height);
    },

    drawBars: function (svg, data, x, y, height, selector, barWidth, xAttr, attrToShowArray) {
        svg.selectAll(".bar")
            .data(data)
            .enter().append("rect")
            .attr("class", "bar" + selector.split(".")[1])
            .attr("x", function (d) {
                return x(d[xAttr]);
            })
            .attr("y", function (d) {
                return y(d[attrToShowArray[0]]);
            })
            .attr("width", barWidth - 1)
            .attr("height", function (d) {
                return height - y(d[attrToShowArray[0]]);
            })
            .on("mouseover", function () {
                select(this);
            })
            .append("title")
            .text(function (d) {
                return (Math.round(d[attrToShowArray[0]] * 1000) / 10) + " %";
            });
    },

    // setter for graphParams
    setGraphParams: function (value) {
        this.set("graphParams", value);
    }
});

export default GraphModel;
