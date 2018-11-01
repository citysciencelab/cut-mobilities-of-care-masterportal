import Theme from "../model";
import * as moment from "moment";

const VerkehrsStaerkenRadTheme = Theme.extend({
    defaults: _.extend({}, Theme.prototype.defaults,
        {
            name: "",
            tageslinieDataset: null,
            wochenlinieDataset: null,
            jahreslinieDataset: null,
            activeTab: "",
            width: 0,
            height: 0
        }),
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": this.parseGfiContent
        });
    },

    /**
     * Ermittelt alle Namen(=Zeilennamen) der Eigenschaften der Objekte
     * @returns {void}
     */
    parseGfiContent: function () {
        var gfiContent, name, tageslinie, wochenlinie, jahrgangslinie;

        if (!_.isUndefined(this.get("gfiContent"))) {
            gfiContent = this.get("gfiContent")[0];
            name = _.has(gfiContent, "Name") ? gfiContent.Name : "unbekannt";
            tageslinie = _.has(gfiContent, "Tageslinie") ? gfiContent.Tageslinie : null;
            wochenlinie = _.has(gfiContent, "Wochenlinie") ? gfiContent.Wochenlinie : null;
            jahrgangslinie = _.has(gfiContent, "Jahrgangslinie") ? gfiContent.Jahrgangslinie : null;

            this.setName(name);

            if (tageslinie) {
                this.setTageslinieDataset(this.splitTageslinieDataset(tageslinie));
            }

            if (wochenlinie) {
                this.setWochenlinieDataset(this.splitWochenlinieDataset(wochenlinie));
            }

            if (jahrgangslinie) {
                this.setJahreslinieDataset(this.splitJahrgangslinieDataset(jahrgangslinie));
            }
            this.setInitialActiveTab();
        }
    },

    /**
     * Prüft die verfügbaren Werte des Features und setzt eine Variable, die im Template ausgewertet wird.
     * @returns {void}
     */
    setInitialActiveTab: function () {
        if (!_.isNull(this.get("tageslinieDataset"))) {
            this.setActiveTab("tag");
        }
        else if (!_.isNull(this.get("wochenlinieDataset"))) {
            this.setActiveTab("woche");
        }
        else if (!_.isNull(this.get("jahreslinieDataset"))) {
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
                month = splitted[0].split(".")[1] - 1,
                year = splitted[0].split(".")[2],
                hours = splitted[1].split(":")[0],
                minutes = splitted[1].split(":")[1],
                seconds = splitted[1].split(":")[2],
                total = parseFloat(splitted[2]),
                r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                r_out = splitted[4] ? parseFloat(splitted[4]) : null;

            tempArr.push({
                timestamp: new Date(year, month, day, hours, minutes, seconds, 0),
                total: total,
                r_in: r_in,
                r_out: r_out
            });
        });

        return _.sortBy(tempArr, "timestamp");
    },

    /**
     * Nimmt den gfiContent, parst den Inhalt und gibt ihn als stukturtiertes JSON zurück
     * @param  {string} wochenlinie gfiContent
     * @return {Object} Object mit timeDate-Object und Value
     */
    splitWochenlinieDataset: function (wochenlinie) {
        var dataSplit = wochenlinie.split("|"),
            tempArr = [];

        _.each(dataSplit, function (data) {
            var splitted = data.split(","),
                // weeknumber = splitted[0],
                day = splitted[1].split(".")[0],
                month = splitted[1].split(".")[1] - 1,
                year = splitted[1].split(".")[2],
                total = parseFloat(splitted[2]),
                r_in = splitted[3] ? parseFloat(splitted[3]) : null,
                r_out = splitted[4] ? parseFloat(splitted[4]) : null;

            tempArr.push({
                timestamp: new Date(year, month, day, 0, 0, 0, 0),
                total: total,
                r_in: r_in,
                r_out: r_out
            });
        });

        return _.sortBy(tempArr, "timestamp");
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
                timestamp: moment().day("Monday").year(year).week(weeknumber).toDate(),
                total: total,
                r_in: r_in,
                r_out: r_out
            });
        });

        return _.sortBy(tempArr, "timestamp");
    },

    /**
     * Ermittelt die Größe des gfiContent und speichert die Werte
     * @returns {void}
     */
    setSize: function () {
        var heightGfiContent = $(".gfi-content").css("height").slice(0, -2),
            heightPegelHeader = $(".radPegelHeader").css("height").slice(0, -2),
            heightNavbar = $(".verkehrsstaerken_rad .nav").css("height").slice(0, -2),
            height = heightGfiContent - heightPegelHeader - heightNavbar - 5,
            width = parseFloat($(".gfi-content").css("width").slice(0, -2));

        this.setHeight(height);
        this.setWidth(width);

        this.createD3Document();
    },

    // setter for width
    setWidth: function (value) {
        this.set("width", value);
    },

    // setter for height
    setHeight: function (value) {
        this.set("height", value);
    },

    // setter for activeTab
    setActiveTab: function (value) {
        this.set("activeTab", value);
    },

    // setter for tageslinieDataset
    setTageslinieDataset: function (data) {
        var datum = moment(data[0].timestamp).format("DD.MM.YYYY"),
            graphArray = this.getDataAttributes(data[0]),
            newData = _.map(data, function (val) {
                val.timestamp = moment(val.timestamp).format("HH:mm") + " Uhr";
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

    // setter for WochenlinieDataset
    setWochenlinieDataset: function (data) {
        var startDatum = moment(data[0].timestamp).format("DD.MM.YYYY"),
            endeDatum = moment(_.last(data).timestamp).format("DD.MM.YYYY"),
            graphArray = this.getDataAttributes(data[0]),
            newData = _.map(data, function (val) {
                val.timestamp = moment(val.timestamp).format("DD.MM.YYYY");
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

    // setter for JahrgangslinieDataset
    setJahreslinieDataset: function (data) {
        var year = moment(data[0].timestamp).format("YYYY"),
            graphArray = this.getDataAttributes(data[0]),
            newData = _.map(data, function (val) {
                val.timestamp = moment(val.timestamp).format("w");
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
        var activeTab = this.get("activeTab");

        if (activeTab === "tag") {
            return this.get("tageslinieDataset");
        }
        else if (activeTab === "woche") {
            return this.get("wochenlinieDataset");
        }
        // activeTab === "jahr"
        return this.get("jahreslinieDataset");
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
    getLegendAttributes: function (inspectData) {
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
                width: this.get("width"),
                height: this.get("height"),
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
     * @returns {void}
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
    }
});

export default VerkehrsStaerkenRadTheme;
