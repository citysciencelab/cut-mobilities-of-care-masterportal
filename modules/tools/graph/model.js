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
            var maxValueArray = [];

            _.each(attrToShowArray, function (attrToShow) {
                maxValueArray.push(d3.max(data, function (d) {
                    return d[attrToShow];
                }));
            });
            // sort desc
            maxValueArray.sort(function (a, b) {
                return b - a;
            });
            return maxValueArray[0];
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
        appendXAxisToSvg: function (svg, height, width, xAxis, marginObj, xAttr) {
            svg.append("g")
                .attr("transform", "translate(0," + (height + 10) + ")")
                .call(xAxis);
            // text for xAxis
            svg.append("text")
                .attr("x", (width / 2))
                .attr("y", height + marginObj.bottom - 5)
                .style("text-anchor", "middle")
                .text(xAttr);
        },
        appendYAxisToSvg: function (svg, height, width, yAxis, marginObj, attrToShow) {
            svg.append("g")
                .attr("transform", "translate(-10,0)")
                .call(yAxis);
            // text for yAxis
            svg.append("text")
                .attr("transform", "rotate(-90)")
                .attr("y", (0 - marginObj.left + 5))
                .attr("x", (0 - (height / 2)))
                .attr("dy", "1em")
                .style("text-anchor", "middle")
                .text(attrToShow);
        },
        appendLinePointsToSvg: function (svg, data, scaleX, scaleY, xAttr, yAttrToShow, div) {
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
                    div.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    div.html(d[yAttrToShow])
                        .attr("style", "background: gray")
                        .style("left", (d3.event.offsetX + 5) + "px")
                        .style("top", (d3.event.offsetY - 5) + "px");
                    })
                .on("mouseout", function () {
                    div.transition()
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
        createLineGraph: function (graphConfig) {
            var selector = graphConfig.selector,
                scaleTypeX = graphConfig.scaleTypeX,
                scaleTypeY = graphConfig.scaleTypeY,
                data = this.parseNoDataFor3D(graphConfig.data),
                xAttr = graphConfig.xAttr,
                attrToShowArray = graphConfig.attrToShowArray,
                margin = {top: 20, right: 20, bottom: 50, left: 100},
                width = $(selector).width() - margin.left - margin.right,
                height = $(selector).height() - margin.top - margin.bottom,
                scaleX = this.createScaleX(data, width, scaleTypeX, xAttr),
                scaleY = this.createScaleY(data, height, scaleTypeY, attrToShowArray),
                valueLine,
                // Tooltip-div needed for scatterplot points
                div = d3.select(".graph-tooltip"),
                // set Axis
                xAxis = this.createAxis(scaleX, "bottom"),
                yAxis = this.createAxis(scaleY, "left"),
                svg = this.createSvg(selector, margin, width, height);

            _.each(attrToShowArray, function (yAttrToShow) {
                valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow);
                this.appendDataToSvg(svg, data, "line", valueLine);
                // Add the scatterplot for each point in line
                this.appendLinePointsToSvg(svg, data, scaleX, scaleY, xAttr, yAttrToShow, div);
            }, this);
            // // Add the Axis
            this.appendXAxisToSvg(svg, height, width, xAxis, margin, xAttr);
            this.appendYAxisToSvg(svg, height, width, yAxis, margin, attrToShowArray[0]);
            this.setGraphParams({
                scaleX: scaleX,
                scaleY: scaleY,
                tooltipDiv: div
            });
        },
        // noData comes as "-" from WMS. turn noData into Value 0
        parseNoDataFor3D: function (dataArray) {
            var parsedDataArray = [];

            _.each(dataArray, function (dataObj) {
                var parsedDataObj = {};

                _.each(dataObj, function (dataVal, dataAttr) {
                    parsedDataObj[dataAttr] = this.parseNoData(dataVal);
                }, this);
                parsedDataArray.push(parsedDataObj);
            }, this);
            return parsedDataArray;
        },
        parseNoData: function (value) {
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
