import {scaleBand, scaleLinear} from "d3-scale";
import {axisBottom, axisLeft} from "d3-axis";
import {line} from "d3-shape";
import {select, event} from "d3-selection";
import "d3-transition";

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

    /**
     * Startet die Erzeugung der Grafik
     * @param   {objekt} graphConfig Konfigurationsobjekt nach graphType
     * @returns {void}
     */
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
            console.error("Unknown scaletype " + scaletype);
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
            console.error("Unknown scaletype " + scaletype);
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
            d3Object = axisLeft(scale)
                .ticks(yAxisTicks.ticks, yAxisTicks.factor);
        }

        return d3Object;
    },

    /**
     * Erzeugt ein D3 - Linienobjekt
     * @param   {object} scaleX      D3 - Scale der xAchse
     * @param   {object} scaleY      D3 - Scale der yAchse
     * @param   {string} xAttr       Attributname für xAchse
     * @param   {string} yAttrToShow Attributname für yAchse
     * @returns {void}
     */
    createValueLine: function (scaleX, scaleY, xAttr, yAttrToShow) {
        return line()
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
     * Erzeugt die Struktur eines Liniengraphen
     * @param   {object}    svg         das SVG-Objekt
     * @param   {object[]}  data        Array der Daten
     * @param   {string}    className   Classes der Punkte
     * @param   {object}    d3line        D3 - Linienobjekt
     * @returns {void}
     */
    appendDataToSvg: function (svg, data, className, d3line) {
        var dataToAdd = _.filter(data, function (obj) {
            return obj.yAttrToShow !== "-";
        });

        svg.append("g")
            .attr("class", "graph-data")
            .attr("transform", function () {
                var y;

                if (svg.select(".graph-legend").size() > 0) {
                    y = svg.select(".graph-legend").node().getBBox().height;

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
     * Fügt die X-Achse .graph-data hinzu
     * @param   {object} svg                                SVG
     * @param   {object} xAxis                              axis-left d3-Object
     * @param   {object} xAxisLabel                         Definitionsobjekt der x-Achse
     * @param   {string} [xAxisLabel.label]                 Text
     * @param   {string} [xAxisLabel.offset=0]              Abstand zwischen Achse und Text
     * @param   {string} [xAxisLabel.textAnchor=middle]     Positionierungsart
     * @param   {string} [xAxisLabel.fill=#000]             Füllfarbe
     * @param   {string} [xAxisLabel.fontSize=10]           FontSize
     * @returns {void}
     */
    appendXAxisToSvg: function (svg, xAxis, xAxisLabel) {
        var textOffset = _.isUndefined(xAxisLabel.offset) ? 0 : xAxisLabel.offset,
            textAnchor = _.isUndefined(xAxisLabel.textAnchor) ? "middle" : xAxisLabel.textAnchor,
            fill = _.isUndefined(xAxisLabel.fill) ? "#000" : xAxisLabel.fill,
            fontSize = _.isUndefined(xAxisLabel.fontSize) ? 10 : xAxisLabel.fontSize,
            label = _.isUndefined(xAxisLabel.label) ? null : [xAxisLabel.label],
            xAxisDraw = xAxis,
            xAxisBBox;

        xAxisDraw = svg.select(".graph-data").selectAll("yAxisDraw")
            .data([1]) // setze ein Dummy-Array mit Länge 1 damit genau einmal die Achse appended wird
            .enter()
            .append("g")
            .attr("transform", function () {
                // gibt den Hochwert des untersten Ticks zurück
                var tick = svg.select(".yAxisDraw .tick").attr("transform"),
                    transform = tick.substring(tick.indexOf("(") + 1, tick.indexOf(")")).split(/\s|,/); // blank oder Komma

                return "translate(0," + transform[1] + ")";
            })
            .attr("class", "xAxisDraw")
            .call(xAxisDraw);

        if (label) {
            xAxisBBox = svg.selectAll(".xAxisDraw").node().getBBox();
            xAxisDraw.append("text")
                .attr("x", xAxisBBox.width / 2)
                .attr("y", xAxisBBox.height + textOffset)
                .attr("dy", "1em")
                .style("text-anchor", textAnchor)
                .style("fill", fill)
                .style("font-size", fontSize)
                .text(label);
        }
    },

    /**
     * Fügt die Y-Achse .graph-data hinzu
     * @param   {object} svg                                SVG
     * @param   {object} yAxis                              axis-left d3-Object
     * @param   {object} yAxisLabel                         Definitionsobjekt der y-Achse
     * @param   {string} [yAxisLabel.label]                 Text
     * @param   {string} [yAxisLabel.offset=0]              Abstand zwischen Achse und Text
     * @param   {string} [yAxisLabel.textAnchor=middle]     Positionierungsart
     * @param   {string} [yAxisLabel.fill=#000]             Füllfarbe
     * @param   {string} [yAxisLabel.fontSize=10]           FontSize
     * @returns {void}
     */
    appendYAxisToSvg: function (svg, yAxis, yAxisLabel) {
        var textOffset = _.isUndefined(yAxisLabel.offset) ? 0 : yAxisLabel.offset,
            textAnchor = _.isUndefined(yAxisLabel.textAnchor) ? "middle" : yAxisLabel.textAnchor,
            fill = _.isUndefined(yAxisLabel.fill) ? "#000" : yAxisLabel.fill,
            fontSize = _.isUndefined(yAxisLabel.fontSize) ? 10 : yAxisLabel.fontSize,
            label = _.isUndefined(yAxisLabel.label) ? null : [yAxisLabel.label],
            yAxisDraw = yAxis,
            yAxisBBox;

        yAxisDraw = svg.select(".graph-data").selectAll("yAxisDraw")
            .data([1]) // setze ein Dummy-Array mit Länge 1 damit genau einmal die Achse appended wird
            .enter()
            .append("g")
            .attr("class", "yAxisDraw")
            .call(yAxisDraw);

        if (label) {
            yAxisBBox = svg.selectAll(".yAxisDraw").node().getBBox();
            yAxisDraw.append("text")
                .attr("transform", "rotate(-90)")
                .attr("x", 0 - (yAxisBBox.height / 2))
                .attr("y", 0 - yAxisBBox.width - (2 * textOffset))
                .attr("dy", "1em")
                .style("text-anchor", textAnchor)
                .style("fill", fill)
                .style("font-size", fontSize)
                .text(label);
        }
    },

    appendLinePointsToSvg: function (svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv) {
        var dat = _.filter(data, function (obj) {
            return obj[yAttrToShow] !== "-";
        });

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
            .attr("r", 5)

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
            .on("mouseover", function (d) {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(d[yAttrToShow])
                    .attr("style", "background: gray")
                    .style("left", (event.offsetX + 5) + "px")
                    .style("top", (event.offsetY - 5) + "px");
            }, tooltipDiv)
            .on("mouseout", function () {
                tooltipDiv.transition()
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", function () {
                        tooltipDiv.style("left", "0px");
                        tooltipDiv.style("top", "0px");
                    }, tooltipDiv);
            }, tooltipDiv)
            .on("click", function (d) {
                tooltipDiv.transition()
                    .duration(200)
                    .style("opacity", 0.9);
                tooltipDiv.html(d[yAttrToShow])
                    .attr("style", "background: gray")
                    .style("left", (event.offsetX + 5) + "px")
                    .style("top", (event.offsetY - 5) + "px");
            }, tooltipDiv);
    },

    /**
     * Erzeugt das SVG
     * @param   {string} selector Class unter der das SVG erzeugt wird
     * @param   {number} left     Linker Rand vom SVG
     * @param   {number} top      Oberer Rand vom SVG
     * @param   {number} width    Breite
     * @param   {number} height   Höhe
     * @param   {string} svgClass Class des SVG
     * @returns {void}
     */
    createSvg: function (selector, left, top, width, height, svgClass) {
        return select(selector).append("svg")
            .attr("width", width)
            .attr("height", height)
            .attr("class", svgClass)
            .append("g")
            .attr("class", "graph")
            .attr("transform", "translate(" + left + "," + top + ")");
    },

    /**
     * Erzeugt eine Legende und fügt sie oben in SVG ein
     * @param   {object}    svg                 SVG
     * @param   {object[]}  legendData          Legendenobjekt
     * @param   {string}    legendData.style    Art des Legendeneintrags <rect> oder <circle>
     * @param   {string}    legendData.class    Class des Eintrags
     * @param   {string}    legendData.text     Textliche Beschreibung
     * @returns {void}
     */
    appendLegend: function (svg, legendData) {
        var legend = svg.append("g")
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
     * Erzeugt die d3 Grafik für ein Liniendiagramm
     * @param   {object}    graphConfig                     Konfigurationsobjekt
     * @param   {string}    graphConfig.selector            Class unter der das SVG erzeugt wird
     * @param   {string}    graphConfig.scaleTypeX          Typ der xAchse
     * @param   {string}    graphConfig.scaleTypeY          Typ der yAchse
     * @param   {object[]}  graphConfig.data                darzustellende Daten
     * @param   {string}    graphConfig.xAttr               Attributname der xAchse
     * @param   {object}    graphConfig.xAxisLabel          Definitionsobjekt der x-Achse
     * @param   {object}    graphConfig.yAxisLabel          Definitionsobjekt der y-Achse
     * @param   {string[]}  graphConfig.attrToShowArray     Array der Attributnamen der yAchse
     * @param   {object}    graphConfig.margin              Margin der .graph-data in .graph
     * @param   {number}    graphConfig.width               Breite des SVG
     * @param   {number}    graphConfig.height              Höhe des SVG
     * @param   {object}    [graphConfig.xAxisTicks]        Tick Beschreibung der xAchse
     * @param   {object}    [graphConfig.yAxisTicks]        Tick Beschreibung der yAchse
     * @param   {number}    [graphConfig.xThinning=1]       Tick Thinning Value
     * @param   {string}    graphConfig.svgClass            Class der SVG
     * @param   {string}    [graphConfig.selectorTooltip]   DIV für Tooltip
     * @param   {object}    [graphConfig.legendData]        Legendeninformationen
     * @returns {void}
     */
    createLineGraph: function (graphConfig) {
        var selector = graphConfig.selector,
            scaleTypeX = graphConfig.scaleTypeX,
            scaleTypeY = graphConfig.scaleTypeY,
            data = graphConfig.data,
            xAttr = graphConfig.xAttr,
            xAxisLabel = graphConfig.xAxisLabel,
            yAxisLabel = graphConfig.yAxisLabel,
            attrToShowArray = graphConfig.attrToShowArray,
            margin = graphConfig.margin,
            width = graphConfig.width - margin.left - margin.right,
            height = graphConfig.height - margin.top - margin.bottom,
            scaleX = this.createScaleX(data, width, scaleTypeX, xAttr),
            scaleY = this.createScaleY(data, height, scaleTypeY, attrToShowArray),
            xAxisTicks = graphConfig.xAxisTicks,
            yAxisTicks = graphConfig.yAxisTicks,
            xThinning = graphConfig.xThinning ? graphConfig.xThinning : 1,
            xAxis = this.createAxisBottom(scaleX, xThinning, xAxisTicks),
            yAxis = this.createAxisLeft(scaleY, yAxisTicks),
            svgClass = graphConfig.svgClass,
            svg = this.createSvg(selector, margin.left, margin.top, graphConfig.width, graphConfig.height, svgClass),
            tooltipDiv = select(graphConfig.selectorTooltip),
            offset = 10,
            valueLine;

        if (_.has(graphConfig, "legendData")) {
            this.appendLegend(svg, graphConfig.legendData);
        }
        _.each(attrToShowArray, function (yAttrToShow) {
            valueLine = this.createValueLine(scaleX, scaleY, xAttr, yAttrToShow);
            this.appendDataToSvg(svg, data, "line", valueLine);
            // Add the scatterplot for each point in line
            this.appendLinePointsToSvg(svg, data, scaleX, scaleY, xAttr, yAttrToShow, tooltipDiv);
        }, this);
        // Add the Axis
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel);

        this.setGraphParams({
            scaleX: scaleX,
            scaleY: scaleY,
            tooltipDiv: tooltipDiv,
            margin: margin,
            offset: offset
        });
    },

    /**
     * Erzeugt die d3 Grafik für ein Balkendiagramm
     * @param   {object}    graphConfig                     Konfigurationsobjekt
     * @param   {string}    graphConfig.selector            Class unter der das SVG erzeugt wird
     * @param   {string}    graphConfig.scaleTypeX          Typ der xAchse
     * @param   {string}    graphConfig.scaleTypeY          Typ der yAchse
     * @param   {object[]}  graphConfig.data                darzustellende Daten
     * @param   {string}    graphConfig.xAttr               Attributname der xAchse
     * @param   {object}    graphConfig.xAxisLabel          Definitionsobjekt der x-Achse
     * @param   {object}    graphConfig.yAxisLabel          Definitionsobjekt der y-Achse
     * @param   {string[]}  graphConfig.attrToShowArray     Array der Attributnamen der yAchse
     * @param   {object}    graphConfig.margin              Margin der .graph-data in .graph
     * @param   {number}    graphConfig.width               Breite des SVG
     * @param   {number}    graphConfig.height              Höhe des SVG
     * @param   {object}    [graphConfig.xAxisTicks]        Tick Beschreibung der xAchse
     * @param   {object}    [graphConfig.yAxisTicks]        Tick Beschreibung der yAchse
     * @param   {string}    graphConfig.svgClass            Class der SVG
     * @param   {object}    [graphConfig.legendData]        Legendeninformationen
     * @returns {void}
     */
    createBarGraph: function (graphConfig) {
        var selector = graphConfig.selector,
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
            xAxis = this.createAxisBottom(scaleX, 1, xAxisTicks),
            yAxis = this.createAxisLeft(scaleY, yAxisTicks),
            svgClass = graphConfig.svgClass,
            svg = this.createSvg(selector, margin.left, margin.top, graphConfig.width, graphConfig.height, svgClass),
            barWidth = width / data.length,
            offset = 0;

        if (_.has(graphConfig, "legendData")) {
            this.appendLegend(svg, graphConfig.legendData);
        }
        this.drawBars(svg, data, scaleX, scaleY, height, selector, barWidth, xAttr, attrToShowArray);
        this.appendYAxisToSvg(svg, yAxis, yAxisLabel, offset);
        this.appendXAxisToSvg(svg, xAxis, xAxisLabel, offset);
    },

    drawBars: function (svg, dataToAdd, x, y, height, selector, barWidth, xAttr, attrToShowArray) {
        svg.append("g")
            .attr("class", "graph-data")
            .attr("transform", function () {
                var legendHeight;

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
                return y(d[attrToShowArray[0]]);
            })
            .attr("width", barWidth - 1)
            .attr("height", function (d) {
                return height - y(d[attrToShowArray[0]]);
            })
            .on("mouseover", function () {
                select(this);
            }, this)
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
