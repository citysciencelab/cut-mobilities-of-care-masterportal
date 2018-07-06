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
            var value;

            _.each(attrToShowArray, function (attrToShow) {
                value = _.max(data, function (d) {
                    return d[attrToShow];
                });
            });
            return value[attrToShowArray[0]];
        },
        createScaleX: function (data, size, scaletype, attr) {
            var rangeArray = [0, size],
                scale,
                maxValue;

            if (scaletype === "ordinal") {
                scale = this.createOrdinalScale(data, rangeArray, [attr]);
            }
            else if (scaletype === "linear") {
                maxValue = this.createMaxValue(data, [attr]);
                scale = this.createLinearScale(0, maxValue, rangeArray);
            }
            else {
                alert("Scaletype not found");
            }
            return scale;
        },
        createScaleY: function (data, size, scaletype, attrToShowArray) {
            var rangeArray = [size, 0],
                scale,
                maxValue;

            if (scaletype === "ordinal") {
                scale = this.createOrdinalScale(data, rangeArray, attrToShowArray);
            }
            else if (scaletype === "linear") {
                maxValue = this.createMaxValue(data, attrToShowArray);
                scale = this.createLinearScale(0, maxValue, rangeArray);
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
            // values.sort(); Sortierung nach String funktioniert nicht für timestamp, daher auskommentiert und Daten vorsortiert
            return d3.scaleBand()
                .range(rangeArray)
                .domain(values);
        },
        createLinearScale: function (minValue, maxValue, rangeArray) {
            return d3.scaleLinear()
                .range(rangeArray)
                .domain([minValue, maxValue])
                .nice();
        },
        // create bottomAxis.
        createAxisBottom: function (scale, xThinningFactor) {
            return d3.axisBottom(scale)
                .tickValues(scale.domain().filter(function (d, i) {
                    var val = i % xThinningFactor;

                    return !val;
                }))
                .tickFormat(function (d) {
                    d = d.toString();
                    return d;
                });
        },
        // create leftAxis. if separator === true (for yAxis), then set thousands-separator "."
        createAxisLeft: function (scale) {
            return d3.axisLeft(scale)
                .tickFormat(function (d) {
                    return d.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
                });
            // .tickFormat(d3.format("d"));
        },
        createValueLine: function (scaleX, scaleY, xAttr, yAttrToShow, offset) {
            return d3.line()
                .x(function (d) {
                    return scaleX(d[xAttr]) + (offset + scaleX.bandwidth() / 2);
                })
                .y(function (d) {
                    return scaleY(d[yAttrToShow]);
                })
                .defined(function (d) {
                    return !isNaN(d[yAttrToShow]);
                });
        },
        appendDataToSvg: function (svg, data, className, object) {
            var data = _.filter(data, function (obj) {
                return obj.yAttrToShow !== "-";
            });

            svg.append("path")
                .data([data])
                .attr("class", className)
                .attr("transform", "translate(0, 20)")
                .attr("d", object);
        },
        appendXAxisToSvg: function (svg, xAxis, xAxisLabel, offset, marginTop) {
            var svgBBox = svg.node().getBBox(),
                xAxis = svg.append("g")
                    // .attr("transform", "translate(" + offset + "," + svgBBox.height + ")")
                    .attr("transform", "translate(" + offset + "," + (svgBBox.height - marginTop) + ")")
                    .attr("class", "xAxis")
                    .call(xAxis),
                xAxisBBox = svg.selectAll(".xAxis").node().getBBox();

            // text for xAxis
            xAxis.append("text")
                .attr("x", xAxisBBox.width / 2)
                .attr("y", xAxisBBox.height + offset + 10)
                .style("text-anchor", "middle")
                .style("fill", "#000")
                .text(xAxisLabel);
        },
        appendYAxisToSvg: function (svg, yAxis, yAxisLabel, offset) {
            var yAxis = svg.append("g")
                    .attr("transform", "translate(0, 20)")
                    .attr("class", "yAxis")
                    .call(yAxis),
                yAxisBBox = svg.selectAll(".yAxis").node().getBBox();

            // text for yAxis
            yAxis.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", 0 - (yAxisBBox.height / 2))
                .attr("y", 0 - yAxisBBox.width - (2 * offset))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .style("fill", "#000")
                .text(yAxisLabel);
        },
        appendLinePointsToSvg: function (svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv, offset) {
            var data = _.filter(data, function (obj) {
                return obj[yAttrToShow] !== "-";
            });

            svg.selectAll("dot")
                .data(data)
                .enter().append("circle")
                .attr("transform", "translate(0, 20)")
                .attr("cx", function (d) {
                    return scaleX(d[xAttr]) + (offset + scaleX.bandwidth() / 2);
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
                        .style("left", (d3.event.offsetX + 5) + "px")
                        .style("top", (d3.event.offsetY - 5) + "px");
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

        getLegendTextArray: function (attrArray, legendArray) {
            var valueArray = [];

            _.each(attrArray, function (attr) {
                var legendObj = _.find(legendArray, function (legend) {
                    if (legend.key === attr) {
                        return legend;
                    }
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
                tooltipDiv = d3.select(graphConfig.selectorTooltip),
                xThinning = graphConfig.xThinning ? graphConfig.xThinning : 1,
                xAxis = this.createAxisBottom(scaleX, xThinning),
                yAxis = this.createAxisLeft(scaleY),
                svg = this.createSvg(selector, margin, width, height),
                offset = 10;

            this.appendLegend(svg, attrToShowArray, graphConfig.legendArray);
            _.each(attrToShowArray, function (yAttrToShow) {

                valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow, offset);
                this.appendDataToSvg(svg, data, "line", valueLine);
                // Add the scatterplot for each point in line
                this.appendLinePointsToSvg(svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv, offset);
            }, this);
            // Add the Axis
            this.appendYAxisToSvg(svg, yAxis, yAxisLabel, offset);
            this.appendXAxisToSvg(svg, xAxis, xAxisLabel, offset, margin.top);

            this.setGraphParams({
                scaleX: scaleX,
                scaleY: scaleY,
                tooltipDiv: tooltipDiv,
                margin: margin,
                offset: offset
            });
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
