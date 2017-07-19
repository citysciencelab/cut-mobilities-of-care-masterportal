define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        Radio = require("backbone.radio"),
        d3 = require("d3"),
        VerkehrsStaerkenTheme;

    VerkehrsStaerkenTheme = Theme.extend({
        defaults: {
            ansicht: "Diagrammansicht",
            link: "https://test.geoportal-hamburg.de/test/test.xlsx"
        },
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
                    zaehlstelle = "",
                    bezeichnung = "",
                    art = "",
                    yearData,
                    dataPerYear = [],
                    year,
                    years = [],
                    actualDataset = {};

                _.each(rowNames, function (rowName) {
                    year = parseInt(rowName.slice(-4), 10);

                    if (rowName === "Zaehlstelle") {
                        zaehlstelle = gfiContent[rowName];
                    }
                    else if (rowName === "Bezeichnung") {
                        bezeichnung = gfiContent[rowName];
                    }
                    else if (rowName === "Art") {
                        art = gfiContent[rowName];
                    }
                    else if (rowName.indexOf("aktuell") !== -1) {
                         var newRowName = "",
                            index = rowName.indexOf("aktuell") - 1,
                            actualDigits = rowName.slice(-7).length,
                            charBeforeAct = rowName.slice(index, -actualDigits);

                        // vorzeichen vor "aktuell prüfen"
                        if (charBeforeAct === "_") {
                            newRowName = rowName.replace("_aktuell", "");
                        }
                        else {
                            newRowName = rowName.replace(" aktuell", "");
                        }
                        actualDataset[newRowName] = gfiContent[rowName];
                    }
                    // jahresDatensätze parsen
                    else if (!_.isNaN(year)) {
                        var newRowName = "",
                            index = rowName.indexOf(String(year)) - 1,
                            yearDigits = rowName.slice(-4).length,
                            charBeforeYear = rowName.slice(index, -yearDigits);

                        // vorzeichen vor year prüfen
                        if (charBeforeYear === "_") {
                            newRowName = rowName.replace("_" + String(year), "");
                        }
                        else {
                            newRowName = rowName.replace(" " + String(year), "");
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
                this.setZaehlstelle(zaehlstelle);
                this.setBezeichnung(bezeichnung);
                this.setArt(art);
                this.setYears(years);
                this.setRowNames(newRowNames);
                this.combineYearsData(dataPerYear, years, newRowNames, actualDataset);
            }
        },

        combineYearsData: function (dataPerYear, years, rowNames, actualDataset) {
            var dataset = [];

            _.each(years, function (year) {
                var attrDataArray = _.where(dataPerYear, {year: year}),
                    yearObject = {year: year};

                _.each(attrDataArray, function (attrData) {
                    yearObject[attrData.attrName] = attrData.value;
                }, this);
                dataset.push(yearObject);
            }, this);
            actualDataset.year = "Aktuell";
            dataset.push(actualDataset);
            this.setDataset(dataset);
        },
        // setter for rowNames
        setRowNames: function (value) {
            this.set("rowNames", value);
        },
        // setter for ansicht
        setAnsicht: function (value) {
            this.set("ansicht", value);
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
                if (_.has(element, "children")) {
                    var children = _.values(_.pick(element, "children"))[0];

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
        createD3Document: function () {
            var graphConfig = {
                graphType: "Linegraph",
                selector: ".graph",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                data: this.getDataset(),
                xAttr: "year",
                attrToShowArray: this.getAttrToShow()
            };

            Radio.trigger("Graph", "createGraph", graphConfig);
            this.manipulateSVG();
        },
        manipulateSVG: function () {
            var graphParams = Radio.request ("Graph", "getGraphParams");
            console.log(graphParams);
            var data = this.parseNoDataFor3D(this.getDataset()),
                svg = d3.select(".graph-svg"),
                scaleX = graphParams.scaleX,
                scaleY = graphParams.scaleY,
                minValue = scaleY.domain()[0],
                div = graphParams.tooltipDiv;

            svg.selectAll("dot")
                .data(data)
                .enter().append("g")
                // .attr("transform", function (d) {
                //     return "rotate(45," + scaleX(d.year) + "," + scaleY(minValue) + ")";
                // })
                .append("g")
                .append("rect")
                .attr("x", function (d) {
                    return scaleX(d.year) - 5;
                })
                .attr("y", function () {
                    return scaleY(minValue) - 5;
                })
                .attr("width", 10)
                .attr("height", 10)
                .attr("class", function (d) {
                    var returnVal = "";

                    if (d.Baustelleneinfluss === "B") {
                        returnVal = "dot_visible";
                    }
                    else {
                        returnVal = "dot_invisible";
                    }
                    return returnVal;
                })
                .on("mouseover", function () {
                    div.transition()
                        .duration(200)
                        .style("opacity", 0.9);
                    div.html("Baustelleneinfluss")
                        .style("left", (d3.event.offsetX + 5) + "px")
                        .style("top", (d3.event.offsetY - 5) + "px");

                    })
                .on("mouseout", function () {
                    div.transition()
                        .duration(500)
                        .style("opacity", 0);
                });
        }
    });

    return VerkehrsStaerkenTheme;
});
