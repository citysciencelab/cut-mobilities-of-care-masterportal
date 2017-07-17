define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
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
                this.setD3Data();
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
                this.setActualDataset(actualDataset);
                this.setZaehlstelle(zaehlstelle);
                this.setBezeichnung(bezeichnung);
                this.setArt(art);
                this.setYears(years);
                this.setRowNames(newRowNames);
                this.combineYearsData(dataPerYear, newRowNames);

            }
        },

        combineYearsData: function (dataPerYear, rowNames) {
            var rowsDatasets = [];

            _.each(rowNames, function (rowName) {
                var attrDataArray = _.where(dataPerYear, {attrName: rowName}),
                    attrObject = {attr: rowName};

                _.each(attrDataArray, function (attrData) {
                    attrObject[attrData.year] = attrData.value;
                });
                rowsDatasets.push(attrObject);
            });
            this.setRowsDatasets(rowsDatasets);
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
        // setter for rowsDatasets
        setRowsDatasets: function (value) {
            this.set("rowsDatasets", value);
        },
        // setter for actualDataset
        setActualDataset: function (value) {
            this.set("actualDataset", value);
        },
        setD3Data: function() {
            this.set("d3Data",[
                {
                attr: "Dtv",
                data: [
                    {year: 2004, value: 115000},
                    {year: 2005, value: 114000},
                    {year: 2006, value: 114000},
                    {year: 2007, value: 117000},
                    {year: 2008, value: 116000},
                    {year: 2009, value: 111000},
                    {year: 2010, value: 111000},
                    {year: 2011, value: 112000},
                    {year: 2012, value: 110000},
                    {year: 2013, value: 115000},
                    {year: 2014, value: 107000},
                    {year: "aktuell", value: 115000}]
                },
                {
                attr: "Dtvw",
                data: [
                    {year: 2004, value: 122000},
                    {year: 2005, value: 121000},
                    {year: 2006, value: 122000},
                    {year: 2007, value: 125000},
                    {year: 2008, value: 123000},
                    {year: 2009, value: 120000},
                    {year: 2010, value: 119000},
                    {year: 2011, value: 120000},
                    {year: 2012, value: 118000},
                    {year: 2013, value: 123000},
                    {year: 2014, value: 113000},
                    {year: "aktuell", value: 122000}]
                },
                {
                attr: "Sv am_dtvw",
                data: [
                    {year: 2004, value: 18},
                    {year: 2005, value: 16},
                    {year: 2006, value: 16},
                    {year: 2007, value: 18},
                    {year: 2008, value: 17},
                    {year: 2009, value: 19},
                    {year: 2010, value: 19},
                    {year: 2011, value: 19},
                    {year: 2012, value: 18},
                    {year: 2013, value: 16},
                    {year: 2014, value: 17},
                    {year: "aktuell", value: 17}]
                },
                {
                attr: "Baustelleneinfluss",
                data: [
                    {year: 2004, value: "B"},
                    {year: 2005, value: "B"},
                    {year: 2006, value: "-"},
                    {year: 2007, value: "-"},
                    {year: 2008, value: "-"},
                    {year: 2009, value: "-"},
                    {year: 2010, value: "-"},
                    {year: 2011, value: "-"},
                    {year: 2012, value: "-"},
                    {year: 2013, value: "-"},
                    {year: 2014, value: "B"},
                    {year: "aktuell", value: "B"}]
                }
                ]);
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
        createD3Document: function () {
            console.log("initializeD3");
            var d3Data = this.get("d3Data"),
                attrToShowInD3 = this.get("attrToShowInD3"),
                dataset = _.findWhere(d3Data, {attr: attrToShowInD3}),
                data = dataset.data;
                console.log(data);
            // set the dimensions and margins of the graph
            var margin = {top: 20, right: 20, bottom: 30, left: 70},
                width = 500 - margin.left - margin.right,
                height = 200 - margin.top - margin.bottom;

            // set the ranges
            var x = d3.scale.ordinal().range([0, width])
              .domain(data.map(function (d) { return d.year; }))
              .rangePoints([0, width]);

            var y = d3.scale.linear().range([height, 0])
              .domain([d3.min(data, function (d) { return d.value; }), d3.max(data, function (d) { return d.value; })]);

            // define the line
            var valueline = d3.svg.line()
                .x(function (d) { return x(d.year); })
                .y(function (d) { return y(d.value); });

            // append the svg obgect to the body of the page
            // appends a 'group' element to 'svg'
            // moves the 'group' element to the top left margin
            var svg = d3.select(".chart").append("svg")
                .attr("width", width + margin.left + margin.right)
                .attr("height", height + margin.top + margin.bottom)
                .append("g")
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
              // Add the valueline path.
            svg.append("path")
                .data([data])
                .attr("class", "line")
                .attr("d", valueline);

            // Add the scatterplot
            svg.selectAll("dot")
                .data(data)
                .enter().append("circle")
                .attr("cx", function(d) { return x(d.year); })
                .attr("cy", function(d) { return y(d.value); })
                .attr("r", 5)
                .attr("class", "dot");

            var xAxis = d3.svg.axis()
                .scale(x)
                .orient("bottom");
            var yAxis = d3.svg.axis()
                .scale(y)
                .orient("left");
              // Add the X Axis
              svg.append("g")
                  .attr("transform", "translate(0," + height + ")")
                  .call(xAxis);

              // Add the Y Axis
              svg.append("g")
                  .call(yAxis);

            // var tooltip = d3.select("svg")
            //     .append("g")
            //     .attr("class", "tooltip")
            //     .append("text")
            //     .style("position", "absolute")
            //     // .style("visibility", "hidden")
            //     .style("background", "red")
            //     .text("a simple tooltip");

            // $(".dot")
            //     .on("mouseover", function (d) {
            //         console.log(d);
            //         console.log(x(d.toElement.__data__.year));
            //         console.log(y(d.toElement.__data__.value));
            //         tooltip.attr("transform", "translate(" + x(d.toElement.__data__.year) + "," + y(d.toElement.__data__.value) + ")");
            //         tooltip.select("text").text(d.toElement.__data__.value);
            //         // return tooltip.style("visibility", "visible");
            //     });
                // .on("mousemove", function(){return tooltip.style("top", (d3.event.pageY-10)+"px").style("left",(d3.event.pageX+10)+"px");})
                // .on("mouseout", function(){return tooltip.style("visibility", "hidden");});
        }
    });

    return VerkehrsStaerkenTheme;
});
