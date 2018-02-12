define(function (require) {

    var Theme = require("modules/tools/gfi/themes/model"),
        Radio = require("backbone.radio"),
        d3 = require("d3"),
        Moment = require("moment"),
        VerkehrsStaerkenRadTheme;

    VerkehrsStaerkenRadTheme = Theme.extend({
        defaults: {
            name: "",
            tageslinieDataset: null,
            wochenlinieDataset: null,
            jahreslinieDataset: null,
            activeTab: "",
            width: 0,
            height: 0
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
                    name = _.has(gfiContent, "Name") ? gfiContent.Name : "unbekannt",
                    tageslinie = _.has(gfiContent, "Tageslinie") ? gfiContent.Tageslinie : null,
                    wochenlinie = _.has(gfiContent, "Wochenlinie") ? gfiContent.Wochenlinie : null,
                    jahrgangslinie = _.has(gfiContent, "Jahrgangslinie") ? gfiContent.Jahrgangslinie : null;

                this.setName(name);

                if (tageslinie) {
                    var obj = this.splitTageslinieDataset(tageslinie);

                    this.setTageslinieDataset(obj);
                }

                if (wochenlinie) {
                    var obj = this.splitWochenlinieDataset(wochenlinie);

                    this.setWochenlinieDataset(obj);
                }

                if (jahrgangslinie) {
                    var obj = this.splitJahrgangslinieDataset(jahrgangslinie);

                    this.setJahreslinieDataset(obj);
                }
                this.setInitialActiveTab();
            }
        },

        /**
         * Prüft die verfügbaren Werte des Features und setzt eine Variable, die im Template ausgewertet wird.
         */
        setInitialActiveTab: function () {
            if (!_.isNull(this.getTageslinieDataset())) {
                this.setActiveTab("tag");
            }
            else if (!_.isNull(this.getWochenlinieDataset())) {
                this.setActiveTab("woche");
            }
            else if (!_.isNull(this.getJahreslinieDataset())) {
                this.setActiveTab("jahr");
            }
        },

        /**
         * Nimmt den gfiContent, parst den Inhalt und gibt ihn als stukturtiertes JSON zurück
         * @param  {string} tageslinie gfiContent
         * @return {Object} Object mit timeDate-Object und Value
         */
        splitTageslinieDataset: function (tageslinie) {
            var dataSplit = tageslinie.split("|"),
                tempArr = [];

            _.each(dataSplit, function (data) {
                var splitted = data.split(","),
                    day = splitted[0].split(".")[0],
                    month = splitted[0].split(".")[1],
                    year = splitted[0].split(".")[2],
                    hours = splitted[1].split(":")[0],
                    minutes = splitted[1].split(":")[1],
                    seconds = splitted[1].split(":")[2],
                    total = parseFloat(splitted[2]),
                    r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                    r_out = splitted[4] ? parseFloat(splitted[4]) : null;

                tempArr.push({
                    timestamp: new Date (year, month, day, hours, minutes, seconds, 0),
                    total: total,
                    r_in: r_in,
                    r_out: r_out
                });
            });

            return tempArr;
        },

        /**
         * Nimmt den gfiContent, parst den Inhalt und gibt ihn als stukturtiertes JSON zurück
         * @param  {string} wochenlinie gfiContent
         * @return {Object} Object mit timeDate-Object und Value
         */
        splitWochenlinieDataset: function (wochenlinie) {
            // var dataSplit = wochenlinie.split("|"),
            //     tempArr = [];

            // _.each(dataSplit, function (data) {
            //     var splitted = data.split(","),
            //         day = splitted[0].split(".")[0],
            //         month = splitted[0].split(".")[1],
            //         year = splitted[0].split(".")[2],
            //         hours = splitted[1].split(":")[0],
            //         minutes = splitted[1].split(":")[1],
            //         seconds = splitted[1].split(":")[2],
            //         total = parseFloat(splitted[2]),
            //         r_in = splitted[3] ? parseFloat(splitted[3]) : null,
            //         r_out = splitted[4] ? parseFloat(splitted[4]) : null;

            //     tempArr.push({
            //         timestamp: new Date (year, month, day, hours, minutes, seconds, 0),
            //         total: total,
            //         r_in: r_in,
            //         r_out: r_out
            //     });
            // });

            // return tempArr;
        },

        /**
         * Nimmt den gfiContent, parst den Inhalt und gibt ihn als stukturtiertes JSON zurück
         * @param  {string} jahrgangslinie gfiContent
         * @return {Object} Object mit timeDate-Object und Value
         */
        splitJahrgangslinieDataset: function (jahrgangslinie) {
            var dataSplit = jahrgangslinie.split("|"),
                tempArr = [];

            _.each(dataSplit, function (data) {
                var splitted = data.split(","),
                    weeknumber = splitted[1],
                    year = splitted[0],
                    total = parseFloat(splitted[2]),
                    r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                    r_out = splitted[4] ? parseFloat(splitted[4]) : null;

                tempArr.push({
                    timestamp: Moment().day("Monday").year(year).week(weeknumber).toDate(),
                    total: total,
                    r_in: r_in,
                    r_out: r_out
                });
            });

            return tempArr;
        },

        /**
         * Ermittelt die Größe des gfiContent und speichert die Werte
         */
        setSize: function () {
            var heightGfiContent = $(".gfi-content").css("height").slice(0, -2),
                heightPegelHeader = $(".radPegelHeader").css("height").slice(0, -2),
                heightNavbar = $(".verkehrsstaerken_rad .nav").css("height").slice(0, -2),
                height = heightGfiContent - heightPegelHeader - heightNavbar,
                width = parseFloat($(".gfi-content").css("width").slice(0, -2));

            this.setHeight(height);
            this.setWidth(width);

            this.createD3Document();
        },

        // getter for width
        getWidth: function () {
            return this.get("width");
        },
        // setter for width
        setWidth: function (value) {
            this.set("width", value);
        },

        // getter for height
        getHeight: function () {
            return this.get("height");
        },
        // setter for height
        setHeight: function (value) {
            this.set("height", value);
        },

        // getter for activeTab
        getActiveTab: function () {
            return this.get("activeTab");
        },
        // setter for activeTab
        setActiveTab: function (value) {
            this.set("activeTab", value);
        },

        // getter for tageslinieDataset
        getTageslinieDataset: function () {
            return this.get("tageslinieDataset");
        },
        // setter for tageslinieDataset
        setTageslinieDataset: function (data) {
            var datum = Moment(data[0].timestamp).format("DD.MM.YYYY"),
                graphArray = this.getDataAttributes(data[0]),
                newData = _.map(data, function (val, count) {
                    val.timestamp = Moment(val.timestamp).format("HH:mm") + " Uhr";
                    return val;
                }),
                legendArray = this.getLegendAttributes(data[0]);

            this.set("tageslinieDataset", {
                data: newData,
                xLabel: "Tagesverlauf am " + datum,
                graphArray: graphArray,
                xThinning: 16,
                legendArray: legendArray
            });
        },

        // getter for wochenlinieDataset
        getWochenlinieDataset: function () {
            return this.get("wochenlinieDataset");
        },
        // setter for WochenlinieDataset
        setWochenlinieDataset: function (data) {
            var startDatum = Moment(data[0].timestamp).format("DD.MM.YYYY"),
                endeDatum = Moment(_.last(data).timestamp).format("DD.MM.YYYY"),
                graphArray = this.getDataAttributes(data[0]),
                newData = _.map(data, function (val) {
                    val.timestamp = Moment(val.timestamp).format("DD.MM.YYYY");
                    return val;
                }),
                legendArray = this.getLegendAttributes(data[0]);

            this.set("wochenlinieDataset", {
                data: newData,
                xLabel: "Woche vom " + startDatum + " bis " + endeDatum,
                graphArray: graphArray,
                xThinning: 1,
                legendArray: legendArray
            });
        },

        // getter for jahreslinieDataset
        getJahreslinieDataset: function () {
            return this.get("jahreslinieDataset");
        },
        // setter for JahrgangslinieDataset
        setJahreslinieDataset: function (data) {
            var year = Moment(data[0].timestamp).format("YYYY"),
                graphArray = this.getDataAttributes(data[0]),
                newData = _.map(data, function (val) {
                    val.timestamp = Moment(val.timestamp).format("w");
                    return val;
                }),
                legendArray = this.getLegendAttributes(data[0]);

            this.set("jahreslinieDataset", {
                data: newData,
                xLabel: "KW im Jahr " + year,
                graphArray: graphArray,
                xThinning: 1,
                legendArray: legendArray
            });
        },

        // setter for name
        setName: function (value) {
            this.set("name", value);
        },

        /**
         * Gibt das Dataset-Objekt passend zum aktiven Tab zurück
         * @return {object} Dataset-Objekt
         */
        getDataset: function () {
            var activeTab = this.getActiveTab();

            if (activeTab === "tag") {
                return this.getTageslinieDataset();
            }
            else if (activeTab === "woche") {
                return this.getWochenlinieDataset();
            }
            else if (activeTab === "jahr") {
                return this.getJahreslinieDataset();
            }
        },

        /**
         * Untersucht welche Graphen vorliegen
         * @param  {object} inspectData Dataset-Objekt
         * @return {array}              Array mit Schlüsselwörtern
         */
        getDataAttributes: function (inspectData) {
            var showData = ["total"];

            if (!_.isNull(inspectData.r_in)) {
                showData.push("r_in");
            }
            if (!_.isNull(inspectData.r_out)) {
                showData.push("r_out");
            }

            return showData;
        },

        /**
         * Untersucht welche Legendeneinträge benötigt werden
         * @param  {object} inspectData Dataset-Objekt
         * @return {array}             Array of Objects
         */
        getLegendAttributes: function(inspectData) {
            var legendData = [{
                key: "total",
                value: "Fahrräder insgesamt"
            }];

            if (!_.isNull(inspectData.r_in)) {
                legendData.push({
                    key: "r_in",
                    value: "Fahrräder stadteinwärts"
                });
            }

            if (!_.isNull(inspectData.r_out)) {
                legendData.push({
                    key: "r_out",
                    value: "Fahrräder stadtauswärts"
                });
            }

            return legendData;
        },

        createD3Document: function () {
            var dataset = this.getDataset(),
                data = dataset.data,
                graphConfig = {
                    graphType: "Linegraph",
                    selector: ".graph",
                    width: this.getWidth(),
                    height: this.getHeight(),
                    selectorTooltip: ".graph-tooltip-div",
                    scaleTypeX: "ordinal",
                    scaleTypeY: "linear",
                    data: data,
                    xAttr: "timestamp",
                    xThinning: dataset.xThinning,
                    xAxisLabel: dataset.xLabel,
                    yAxisLabel: "Anzahl Fahrräder",
                    attrToShowArray: dataset.graphArray,
                    legendArray: dataset.legendArray
                };

            Radio.trigger("Graph", "createGraph", graphConfig);
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
        }
    });

    return VerkehrsStaerkenRadTheme;
});
