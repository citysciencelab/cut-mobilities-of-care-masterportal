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
                // fakeGFIContent setzen, bis layer entsprechende Daten liefert
                this.setFakeContent();
                var gfiContent = this.getGfiContent()[0],
                    rowNames = _.keys(this.getGfiContent()[0]),
                    newRowNames = [],
                    zaehlstelle = "",
                    bezeichnung = "",
                    ebene = "",
                    art = "",
                    yearData,
                    dataPerYear = [],
                    year,
                    years = [];

                _.each(rowNames, function (rowName) {
                    year = parseInt(rowName.slice(0, 4), 10);
                    if (rowName === "Zählstelle") {
                        zaehlstelle = gfiContent[rowName];
                    }
                    else if (rowName === "Bezeichnung") {
                        bezeichnung = gfiContent[rowName];
                    }
                    else if (rowName === "Ebene") {
                        ebene = gfiContent[rowName];
                    }
                    else if (rowName === "Art") {
                        art = gfiContent[rowName];
                    }
                    // jahresDatensätze parsen
                    else if (!_.isNaN(year)) {
                        var newRowName = rowName.replace(year + "_", "");

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
                this.setEbene(ebene);
                this.setArt(art);
                this.setYears(years);
                this.setRowNames(newRowNames);
                this.combineYearsData(dataPerYear, newRowNames);
                this.initializeD3();
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
        // setter for ebene
        setEbene: function (value) {
            this.set("ebene", value);
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
        initializeD3: function () {

            console.log("initializeD3");
            var bodySelection = d3.select("body"),
                theData = [1, 2, 3, 4];
                // svgSelection = bodySelection.append("svg")
                //     .attr("width", 50)
                //     .attr("height", 50);

            // svgSelection.append("circle")
            //     .attr("cx", 25)
            //     .attr("cy", 25)
            //     .attr("r", 25)
            //     .style("fill", "purple");

            bodySelection
                .data(theData)
                .enter()
                .append("p")
                .text("hello ");
        },
        setFakeContent: function () {
             this.setGfiContent([{
                Zählstelle: "1145",
                Bezeichnung: "A7 SO AS HH-Othmarschen (Elbtunnel) T15 DP14",
                Ebene: "15",
                Art: "Dauerpegel",
                "2004_DTV": "115000",
                "2004_DTVw": "122000",
                "2004_SV-Anteil am DTVw (%)": "17",
                "2004_Baustelleneinfluss": "*",
                "2005_DTV": "115111",
                "2005_DTVw": "122111",
                "2005_SV-Anteil am DTVw (%)": "11",
                "2005_Baustelleneinfluss": "*",
                "2006_DTV": "115222",
                "2006_DTVw": "122222",
                "2006_SV-Anteil am DTVw (%)": "22",
                "2006_Baustelleneinfluss": "*",
                "2007_DTV": "115333",
                "2007_DTVw": "122333",
                "2007_SV-Anteil am DTVw (%)": "33",
                "2007_Baustelleneinfluss": "*",
                "2008_DTV": "115444",
                "2008_DTVw": "122444",
                "2008_SV-Anteil am DTVw (%)": "44",
                "2008_Baustelleneinfluss": "*",
                "2009_DTV": "115555",
                "2009_DTVw": "122555",
                "2009_SV-Anteil am DTVw (%)": "55",
                "2009_Baustelleneinfluss": "*",
                "2010_DTV": "115666",
                "2010_DTVw": "122666",
                "2010_SV-Anteil am DTVw (%)": "66",
                "2010_Baustelleneinfluss": "*",
                "2011_DTV": "115777",
                "2011_DTVw": "122777",
                "2011_SV-Anteil am DTVw (%)": "77",
                "2011_Baustelleneinfluss": "*",
                "2012_DTV": "115888",
                "2012_DTVw": "122888",
                "2012_SV-Anteil am DTVw (%)": "88",
                "2012_Baustelleneinfluss": "*"
            }]);
        }
    });

    return VerkehrsStaerkenTheme;
});
