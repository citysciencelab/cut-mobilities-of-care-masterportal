define(function (require) {

    var d3 = require("d3"),
        Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        GraphModel;

    GraphModel = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("Graph");

            channel.on({
                "createGraph": this.createGraph
            }, this);
            channel.reply({
                "getGraphParams": function () {
                    return this.getGraphParams();
                    }
            }, this);
        },
        createGraph: function (graphConfig) {
            if (graphConfig.graphType === "Linegraph") {
                this.createLineGraph(graphConfig);
            }
        },
        createMaxValue: function (data, attrToShowArray) {
            var maxValue = data[0][attrToShowArray[0]];

            _.each(attrToShowArray, function (attrToShow) {
                var value = d3.max(data, function (d) {
                    return d[attrToShow];
                });

                if (value > maxValue) {
                    maxValue = value;
                }
            });
            return maxValue;
        },
        createMinValue: function (data, attrToShowArray) {
            var minValue = data[0][attrToShowArray[0]];

            _.each(attrToShowArray, function (attrToShow) {
                var value = d3.min(data, function (d) {
                    return d[attrToShow];
                });

                if (value < minValue) {
                    minValue = value;
                }
            });
            return minValue;
        },
        createScaleX: function (data, size, scaletype, attr) {
            var rangeArray = [0, size],
                scale,
                minValue,
                maxValue;

            if (scaletype === "ordinal") {
                scale = this.createOrdinalScale(data, rangeArray, [attr]);
            }
            else if (scaletype === "linear") {
                minValue = this.createMinValue(data, [attr]);
                maxValue = this.createMaxValue(data, [attr]);
                scale = this.createLinearScale(minValue, maxValue, rangeArray);
            }
            else {
                alert("Scaletype not found");
            }
            return scale;
        },
        createScaleY: function (data, size, scaletype, attrToShowArray) {
            var rangeArray = [size, 0],
                scale,
                minValue,
                maxValue;

            if (scaletype === "ordinal") {
                scale = this.createOrdinalScale(data, rangeArray, attrToShowArray);
            }
            else if (scaletype === "linear") {

                minValue = this.createMinValue(data, attrToShowArray);
                maxValue = this.createMaxValue(data, attrToShowArray);
                scale = this.createLinearScale(minValue, maxValue, rangeArray);
            }
            else {
                alert("Scaletype not found");
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
            values.sort();
            return d3.scale.ordinal()
                    .domain(values)
                    .rangePoints(rangeArray);
        },
        createLinearScale: function (minValue, maxValue, rangeArray) {
            return d3.scale.linear().range(rangeArray)
                    .domain([minValue, maxValue]);
        },
        createAxis: function (scale, position) {
            return d3.svg.axis()
                    .scale(scale)
                    .tickFormat(function (d) {
                        return String(d);
                    })
                    .orient(position);
        },
        createValueLine: function (scaleX, scaleY, xAttr, yAttrToShow) {
            return d3.svg.line()
                    .x(function (d) {
                        return scaleX(d[xAttr]);
                    })
                    .y(function (d) {
                        return scaleY(d[yAttrToShow]);
                    });
        },
        appendDataToSvg: function (svg, data, className, object) {
            svg.append("path")
                .data([data])
                .attr("class", className)
                .attr("d", object);
        },
        appendXAxisToSvg: function (svg, xAxis, xAttr, offset) {
            var svgBBox = svg.node().getBBox(),
                xAxis = svg.append("g")
                    .attr("transform", "translate(0," + svgBBox.height + ")")
                    .attr("class", "xAxis")
                    .call(xAxis),
                xAxisBBox = svg.selectAll(".xAxis").node().getBBox();
            // text for xAxis
            xAxis.append("text")
                .attr("x", (xAxisBBox.width / 2))
                .attr("y", (xAxisBBox.height + offset))
                .style("text-anchor", "middle")
                .text(xAttr);
        },
        appendYAxisToSvg: function (svg, yAxis, attrToShow, offset) {
            var svgBBox = svg.node().getBBox(),
                yAxis = svg.append("g")
                .attr("transform", "translate(" + svgBBox.x + ",0)")
                .attr("class", "yAxis")
                .call(yAxis),
                yAxisBBox = svg.selectAll(".yAxis").node().getBBox();
            // text for yAxis
            yAxis.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", (0 - (yAxisBBox.height / 2)))
                .attr("y", (0 - yAxisBBox.width - (2 * offset)))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(attrToShow);
        },
        appendLinePointsToSvg: function (svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv) {
            svg.selectAll("dot")
                .data(data)
                .enter().append("circle")
                .attr("cx", function (d) {
                    return scaleX(d[xAttr]);
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
                        .style("left", (d3.event.offsetX + 5) + "px")
                        .style("top", (d3.event.offsetY - 5) + "px");
                    })
                .on("mouseout", function () {
                    tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                    });
        },
        createSvg: function (selector, marginObj, width, height) {
            return d3.select(selector).append("svg")
                    .attr("width", width + marginObj.left + marginObj.right)
                    .attr("height", height + marginObj.top + marginObj.bottom)
                    .attr("class", "graph-svg")
                        .append("g")
                        .attr("transform", "translate(" + marginObj.left + "," + marginObj.top + ")");
        },
        appendLegend: function (svg, attrToShowArray) {
            var BBox = svg.node().getBBox(),
                legend = svg.append("g")
                    .attr("class", "graph-legend")
                    .selectAll("g")
                    .data(attrToShowArray)
                    .enter()
                    .append("g")
                        .attr("class", "graph-legend-item")
                        .attr("transform", function (d, i) {
                        var deltaHeight = 15,
                            x = BBox.x,
                            y = ((i * deltaHeight) + BBox.height);

                        return "translate(" + x + "," + y + ")";
                    });

            legend.append("circle")
                .attr("cx", 5)
                .attr("cy", 5)
                .attr("r", 5)
                .attr("class", "dot");

            legend.append("text")
                .attr("x", 20)
                .attr("y", 10)
                .text(function (d) {
                    return d;
                });
        },
        createLineGraph: function (graphConfig) {
            var selector = graphConfig.selector,
                scaleTypeX = graphConfig.scaleTypeX,
                scaleTypeY = graphConfig.scaleTypeY,
                noParseFloatArray = graphConfig.noParseFloatArray,
                data = this.parseData(graphConfig.data, noParseFloatArray),
                // data = graphConfig.data,
                xAttr = graphConfig.xAttr,
                attrToShowArray = graphConfig.attrToShowArray,
                margin = {top: 20, right: 20, bottom: 70, left: 100},
                width = $(selector).width() - margin.left - margin.right,
                height = $(selector).height() - margin.top - margin.bottom,
                scaleX = this.createScaleX(data, width, scaleTypeX, xAttr),
                scaleY = this.createScaleY(data, height, scaleTypeY, attrToShowArray),
                valueLine,
                tooltipDiv = d3.select(graphConfig.selectorTooltip),
                xAxis = this.createAxis(scaleX, "bottom"),
                yAxis = this.createAxis(scaleY, "left"),
                svg = this.createSvg(selector, margin, width, height),
                offset = 10;

            _.each(attrToShowArray, function (yAttrToShow) {
                valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow);
                this.appendDataToSvg(svg, data, "line", valueLine);
                // Add the scatterplot for each point in line
                this.appendLinePointsToSvg(svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv);
            }, this);
            // Add the Axis
            this.appendXAxisToSvg(svg, xAxis, xAttr, offset);
            this.appendYAxisToSvg(svg, yAxis, attrToShowArray[0], offset);
            this.appendLegend(svg, attrToShowArray);
            this.setGraphParams({
                scaleX: scaleX,
                scaleY: scaleY,
                tooltipDiv: tooltipDiv,
                margin: margin,
                offset: offset
            });
        },
        /*
        * noData comes as "-" from WMS. turn noData into Value 0
        * if data should not be converted, the attr name is in noParseFloatArray. then dont parseFloat
        */
        parseData: function (dataArray, noParseFloatArray) {
            var parsedDataArray = [];

            _.each(dataArray, function (dataObj) {
                var parsedDataObj = {};

                _.each(dataObj, function (dataVal, dataAttr) {
                    if (_.contains(noParseFloatArray, dataAttr)) {
                        parsedDataObj[dataAttr] = this.parseNoDataValue(dataVal);
                    }
                    else {
                        parsedDataObj[dataAttr] = parseFloat(this.parseNoDataValue(dataVal));
                    }
                }, this);
                parsedDataArray.push(parsedDataObj);
            }, this);
            return parsedDataArray;
        },

        parseNoDataValue: function (value) {
            if (value === "-") {
                value = 0;
            }
            return value;
        },

        // getter for graphParams
        getGraphParams: function () {
            return this.get("graphParams");
        },
        // setter for graphParams
        setGraphParams: function (value) {
            this.set("graphParams", value);
        }
    });

    return GraphModel;
});
