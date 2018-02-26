define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        Radio = require("backbone.radio"),
        d3 = require("d3"),
        VerkehrsStaerkenTheme;

    VerkehrsStaerkenTheme = Theme.extend({
        defaults: _.extend({}, Theme.prototype.defaults,
            {
                ansicht: "Diagrammansicht",
                link: "http://daten-hamburg.de/transport_verkehr/verkehrsstaerken/DTV_DTVw_Download.xlsx",
                zaehlstelle: "",
                bezeichnung: "",
                art: "",
                years: [],
                rowNames: [],
                dataset: []
            }
        ),
        initialize: function () {
            this.listenTo(this, {
                "change:isReady": this.parseGfiContent
            });
        },
        /**
         * Ermittelt alle Namen(=Zeilennamen) der Eigenschaften der Objekte
         */
        parseGfiContent: function () {
            if (_.isUndefined(this.get("gfiContent")) === false) {
                var gfiContent = this.getGfiContent()[0],
                    rowNames = _.keys(this.getGfiContent()[0]),
                    newRowNames = [],
                    yearData,
                    dataPerYear = [],
                    year,
                    years = [];

                _.each(rowNames, function (rowName) {
                    var newRowName, index, yearDigits, charBeforeYear;

                    year = parseInt(rowName.slice(-4), 10);

                    if (rowName === "Zählstelle") {
                        this.setZaehlstelle(gfiContent[rowName]);
                    }
                    else if (rowName === "Bezeichnung") {
                        this.setBezeichnung(gfiContent[rowName]);
                    }
                    else if (rowName === "Art") {
                        this.setArt(gfiContent[rowName]);
                    }
                    // jahresDatensätze parsen
                    else if (!_.isNaN(year)) {
                        newRowName = "";
                        index = rowName.indexOf(String(year)) - 1;
                        yearDigits = rowName.slice(-4).length;
                        charBeforeYear = rowName.slice(index, -yearDigits);

                        // vorzeichen vor year prüfen
                        if (charBeforeYear === "_") {
                            newRowName = rowName.replace("_" + String(year), "").trim();
                        }
                        else {
                            newRowName = rowName.replace(" " + String(year), "").trim();
                        }
                        yearData = {
                            year: year,
                            attrName: newRowName,
                            value: gfiContent[rowName]
                        };
                        dataPerYear.push(yearData);
                        newRowNames.push(newRowName);
                        years.push(year);
                    }
                }, this);
                newRowNames = _.unique(newRowNames);
                years = _.unique(years);
                this.setYears(years);
                this.setRowNames(newRowNames);
                this.combineYearsData(dataPerYear, years);
            }
        },

        combineYearsData: function (dataPerYear, years) {
            var dataset = [];

            _.each(years, function (year) {
                var attrDataArray = _.where(dataPerYear, {year: year}),
                    yearObject = {year: year};

                _.each(attrDataArray, function (attrData) {
                    yearObject[attrData.attrName] = attrData.value;
                }, this);
                dataset.push(yearObject);
            }, this);
            dataset = this.parseData(dataset);
            this.setDataset(dataset);
        },
        // setter for rowNames
        setRowNames: function (value) {
            this.set("rowNames", value);
        },
        // setter for years
        setYears: function (value) {
            this.set("years", value);
        },
        // setter for art
        setArt: function (value) {
            this.set("art", value);
        },
        // setter for bezeichnung
        setBezeichnung: function (value) {
            this.set("bezeichnung", value);
        },
        // setter for zaehlstelle
        setZaehlstelle: function (value) {
            this.set("zaehlstelle", value);
        },
        setDataset: function (value) {
            this.set("dataset", value);
        },
        getDataset: function () {
            return this.get("dataset");
        },
        // getter for attrToShow
        getAttrToShow: function () {
            return this.get("attrToShow");
        },
        // setter for attrToShow
        setAttrToShow: function (value) {
            this.set("attrToShow", value);
        },
        /**
         * Alle children und Routable-Button (alles Module) im gfiContent müssen hier removed werden.
         */
        destroy: function () {
            _.each(this.get("gfiContent"), function (element) {
                var children;

                if (_.has(element, "children")) {
                    children = _.values(_.pick(element, "children"))[0];

                    _.each(children, function (child) {
                        child.val.remove();
                    }, this);
                }
            }, this);
            _.each(this.get("gfiRoutables"), function (element) {
                if (_.isObject(element) === true) {
                    element.remove();
                }
            }, this);
        },
         /*
        * noData comes as "-" from WMS. turn noData into ""
        * try to parse data to float
        */
        parseData: function (dataArray) {
            var parsedDataArray = [];

            _.each(dataArray, function (dataObj) {
                var parsedDataObj = {};

                _.each(dataObj, function (dataVal, dataAttr) {
                    var dataVal = this.parseDataValue(dataVal),
                        parseFloatVal = parseFloat(dataVal);

                    if (isNaN(parseFloatVal)) {
                        parsedDataObj[dataAttr] = dataVal;
                    }
                    else {
                        parsedDataObj[dataAttr] = parseFloatVal;
                    }
                }, this);
                parsedDataArray.push(parsedDataObj);
            }, this);

            return parsedDataArray;
        },
        parseDataValue: function (value) {
            if (value === "*") {
                value = "Ja";
            }
            return value;
        },
        createD3Document: function () {
            var heightGfiContent = $(".gfi-content").css("height").slice(0, -2),
                heightPegelHeader = $(".pegelHeader").css("height").slice(0, -2),
                heightNavbar = $(".verkehrsstaerken .nav").css("height").slice(0, -2),
                heightBtnGroup = $(".verkehrsstaerken #diagramm .btn-group").css("height").slice(0, -2),
                height = heightGfiContent - heightPegelHeader - heightNavbar - heightBtnGroup,
                width = $(".gfi-content").css("width").slice(0, -2),
                graphConfig = {
                graphType: "Linegraph",
                selector: ".graph",
                width: width,
                height: height,
                selectorTooltip: ".graph-tooltip-div",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: this.getDataset(),
                xAttr: "year",
                xAxisLabel: "Jahr",
                attrToShowArray: this.getAttrToShow(),
                legendArray: [{
                    key: "DTV",
                    value: "DTV (Kfz/24h)"
                }, {
                    key: "DTVw",
                    value: "DTVw (Kfz/24h)"
                }, {
                    key: "Schwerverkehrsanteil am DTVw",
                    value: "SV-Anteil am DTVw (%)"
                }]
            };

            Radio.trigger("Graph", "createGraph", graphConfig);
            this.manipulateSVG();
        },
        manipulateSVG: function () {
            var graphParams = Radio.request ("Graph", "getGraphParams"),
                data = this.getDataset(),
                svg = d3.select(".graph-svg"),
                scaleX = graphParams.scaleX,
                scaleY = graphParams.scaleY,
                tooltipDiv = graphParams.tooltipDiv,
                margin = graphParams.margin,
                offset = graphParams.offset,
                size = 10,
                attrToShowArray = this.getAttrToShow(),
                width,
                height,
                x,
                y,
                legendBBox;

            data = _.filter(data, function (obj) {
                return obj[attrToShowArray[0]] !== "-";
            });
            svg.selectAll("dot")
                .data(data)
                .enter().append("g")
                .append("rect")
                .attr("x", function (d) {
                    return scaleX(d.year) + margin.left - (size / 2) + (offset + scaleX.bandwidth() / 2);
                })
                .attr("y", function (d) {
                    return scaleY(d[attrToShowArray[0]]) + (size / 2) + offset + margin.top;
                })
                .attr("width", size)
                .attr("height", size)
                .attr("class", function (d) {
                    var returnVal = "";

                    if (_.has(d, "Baustelleneinfluss") && d[attrToShowArray] !== "-") {
                        returnVal = "dot_visible";
                    }
                    else {
                        returnVal = "dot_invisible";
                    }
                    return returnVal;
                })
                .on("mouseover", function (d) {
                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltipDiv.html(d[attrToShowArray[0]])
                        .attr("style", "background: gray")
                        .style("left", (d3.event.offsetX + 5) + "px")
                        .style("top", (d3.event.offsetY - 5) + "px");

                    })
                .on("mouseout", function () {
                    tooltipDiv.transition()
                        .duration(500)
                        .style("opacity", 0);
                })
                .on("click", function (d) {
                    tooltipDiv.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    tooltipDiv.html(d[attrToShowArray[0]])
                        .attr("style", "background: gray")
                        .style("left", (d3.event.offsetX + 5) + "px")
                        .style("top", (d3.event.offsetY - 5) + "px");
                    });
            legendBBox = svg.selectAll(".graph-legend").node().getBBox(),
                width = legendBBox.width,
                height = legendBBox.height,
                x = legendBBox.x,
                y = legendBBox.y;

            svg.selectAll(".graph-legend").append("g")
                .append("rect")
                .attr("width", 10)
                .attr("height", 10)
                .attr("class", "dot_visible")
                .attr("transform", "translate(" + (x + width + 10) + "," + (y + 2.5) + ")");

            legendBBox = svg.selectAll(".graph-legend").node().getBBox();
                width = legendBBox.width;
                height = legendBBox.height;
                x = legendBBox.x;
                y = legendBBox.y;

            svg.selectAll(".graph-legend").append("g")
                .append("text")
                .attr("x", 10)
                .attr("y", 10)
                .attr("transform", "translate(" + (x + width) + "," + (y + 2.5) + ")")
                .text(this.createAndGetLegendText(attrToShowArray[0]));
        },

        createAndGetLegendText: function (value) {
            if (value === "DTV") {
                return "DTV (Kfz/24h) mit Baustelleneinfluss";
            }
            else if (value === "DTVw") {
                return "DTVw (Kfz/24h) mit Baustelleneinfluss";
            }
            else {
                return "SV-Anteil am DTVw (%) mit Baustelleneinfluss";
            }
        }
    });

    return VerkehrsStaerkenTheme;
});
