import Theme from "../../model";

const BalkendiagrammTheme = Theme.extend(/** @lends BalkendiagrammTheme.prototype */{
    defaults: Object.assign({}, Theme.prototype.defaults, {
        // default values to be set for the template
        themeTitle: "",
        description: "",
        dataset: [],
        tableContent: [],
        themeUnit: "",
        themeCategory: "",
        themeType: ""
    }),

    /**
     * @class BalkendiagrammTheme
     * @extends Backbone.Model
     * @memberof Tools.Gfi.Themes.Bildungsatlas
     * @constructs
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                const layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": this.get("gfiTheme"), "id": this.get("themeId")}),
                    gfiProperties = this.get("gfiContent").allProperties;
                let gfiBildungsatlasFormat,
                    statisticWithYear,
                    latestValue,
                    rawTableContent,
                    tableContent;

                if (layerList && Array.isArray(layerList) && layerList.length > 0 && layerList[0].get("gfiFormat") && layerList[0].get("gfiFormat").gfiBildungsatlasFormat) {
                    gfiBildungsatlasFormat = layerList[0].get("gfiFormat").gfiBildungsatlasFormat;
                    statisticWithYear = this.getStatisticWithYear(gfiProperties, gfiBildungsatlasFormat.themeCategory, "jahr_");
                    latestValue = statisticWithYear.length >= 1 ? statisticWithYear[statisticWithYear.length - 1].number : null;
                    rawTableContent = this.getRawTableContent(gfiProperties, gfiBildungsatlasFormat.layerType, gfiBildungsatlasFormat.themeUnit, latestValue);
                    tableContent = this.getRevertData(rawTableContent, gfiBildungsatlasFormat.themeUnit, gfiProperties.stadtteil);
                }

                // set the tableContent for the template
                this.set("tableContent", tableContent);

                // set the data formats for the layer
                this.set("themeUnit", gfiBildungsatlasFormat.themeUnit);
                this.set("themeCategory", gfiBildungsatlasFormat.themeCategory);
                this.set("themeType", gfiBildungsatlasFormat.themeType);

                // set the description for the BarGraph
                if (layerList && Array.isArray(layerList) && layerList.length > 0 && layerList[0].get("gfiFormat") && layerList[0].get("gfiFormat").gfiBildungsatlasDescription) {
                    this.set("description", layerList[0].get("gfiFormat").gfiBildungsatlasDescription);
                }

                // set the statistic with year for BarGraph
                this.set("dataset", statisticWithYear);
            },

            "change:isVisible": function () {
                const timeOut = this.checkIsMobile() ? 300 : 100;

                setTimeout(this.createD3Document.bind(this), timeOut);
            }
        });
    },

    /**
     * here the content for the gfi-theme table will be parsed - note: to optimize this data this.getRevertData is used
     * @param {Object} gfiProperties the given data for this theme gotten by this.get("gfiContent").allProperties
     * @param {String} layerType as set in the config.json -> gfiFormat -> gfiBildungsatlasFormat
     * @param {String} themeUnit as set in the config.json -> gfiFormat -> gfiBildungsatlasFormat
     * @param {Number} latestValue the latest (youngest) value found in gfiProperties (you may use this.getStatisticWithYear to single it out)
     * @pre the themeTitle (see defaults) is not set for the template yet
     * @post the themeTitle (see defaults) for the template is set correctly
     * @returns {Object}  - an object with keys as used in the template and values not yet optimized
     */
    getRawTableContent: function (gfiProperties, layerType, themeUnit, latestValue) {
        const content = {};
        // note: content needs no default values as it is iterated in the template and shown with key/value pairs as they are

        if (layerType === "Stadtteile") {
            this.set("themeTitle", gfiProperties.stadtteil);

            // Check if this is a layer of wanderungen by themeUnit
            if (themeUnit === "anteilWanderungen") {
                content["In " + gfiProperties.stadtteil] = latestValue;
                content["Anteil der Zuzüge aus dem Umland:"] = gfiProperties.zuzuege_aus_umland;
                content["Anteil der Zuzüge ins Umland:"] = gfiProperties.fortzuege_aus_dem_umland;
            }
            else {
                content[gfiProperties.stadtteil] = latestValue;
                content["Bezirk " + gfiProperties.bezirk] = gfiProperties.summe_bezirk;
                content.Hamburg = gfiProperties.summe_hamburg;
            }
        }
        else if (layerType === "Sozialräume") {
            this.set("themeTitle", gfiProperties.sozialraum_name);

            content[gfiProperties.sozialraum_name] = latestValue;
            content["Bezirk " + gfiProperties.bezirk] = gfiProperties.summe_bezirk;
            content.Hamburg = gfiProperties.summe_hamburg;
        }
        else if (layerType === "Statistische Gebiete") {
            this.set("themeTitle", gfiProperties.stadtteil + ": " + gfiProperties.statgebiet);

            if (themeUnit !== "anteilWanderungen") {
                content["Statistisches Gebiet"] = latestValue;
                content[gfiProperties.stadtteil] = gfiProperties.summe_stadtteil;
                content["Bezirk " + gfiProperties.bezirk] = gfiProperties.summe_bezirk;
                content.Hamburg = gfiProperties.summe_hamburg;
            }
            else {
                content["im Statistischen Gebiet"] = latestValue;
            }
        }

        return content;
    },

    /**
     * Here we get the data with the year for preparaing the balkendiagram
     * @param {Object} gfiProperties the content for this theme gotten by this.get("gfiContent").allProperties
     * @param {Object} themeCategory the category of the theme based on config.json -> gfiFormat -> gfiBildungsatlasFormat
     * @param {String} yearPrefix the prefix to search for in gfiProperties for data prefix+year to be used for the result
     * @returns {Array}  - an array of objects [{String: year, Integer: number}] found in gfiProperties where data has key prefixed with yearPrefix
     */
    getStatisticWithYear: function (gfiProperties, themeCategory, yearPrefix) {
        const dataset = [],
            regEx = new RegExp("^" + yearPrefix + "(\\d{4})$");
        let key,
            year,
            regRes;

        for (key in gfiProperties) {
            regRes = regEx.exec(key);
            if (regRes === null || !regRes[1]) {
                continue;
            }
            year = regRes[1];

            if (themeCategory === "schule") {
                year = Number(year.slice(-2)) + "/" + (Number(year.slice(-2)) + 1);
            }
            dataset.push({"year": year, "number": Number(gfiProperties[key])});
        }

        return dataset;
    },

    /**
     * Revert the null or empty value to standard value
     * check if the percentage should be added
     * @param {Object} content the full content of data created in setContent
     * @param {String} themeUnit the themeUnit as defined in config.json => gfiFormat => gfiBildungsatlasFormat
     * @param {String} nameStadtteil the name of the Stadtteil - should be found in this.get("gfiContent").allProperties
     * @returns {Object} the content with reverted/optimized data
     */
    getRevertData: function (content, themeUnit, nameStadtteil) {
        const result = {};
        let key = "",
            value = "";

        for (key in content) {
            if (content[key] === null || content[key] === undefined) {
                result[key] = "*g.F.";
            }
            else if (themeUnit === "anzahl") {
                value = this.getValueByKey(content[key]);
                result[key] = Math.round(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
            }
            else if (themeUnit === "anteil") {
                value = this.getValueByKey(content[key]);
                result[key] = Math.round(value) + "%";
            }
            else if (themeUnit === "anteilWanderungen") {
                value = this.getValueByKey(content[key]);
                if (key.includes("im Statistischen Gebiet") || key.includes("In " + nameStadtteil)) {
                    result[key] = (value > 0 ? "+" : "") + (Math.round(value * 100) / 100).toString().replace(/\./g, ",");
                }
                else {
                    result[key] = (Math.round(value * 100) / 100).toString().replace(/\./g, ",") + "%";
                }
            }
            else {
                result[key] = content[key];
            }
        }

        return result;
    },

    /**
     * @param {object} value the value from the content with individual key
     * @returns {String}  - the well formed value to be shown on mouse hover
     */
    getValueByKey (value) {
        if (isNaN(Number(value))) {
            return 0;
        }
        return value;
    },

    /**
     * setter for TooltipValue of the BarGraph - note that this is sourced out because of its complexity (must be testable - see testings)
     * @param {Number} value the value to be shown
     * @param {String} themeUnit as set in config.json => gfiFormat => gfiBildungsatlasFormat
     * @returns {String}  - the well formed value to be shown on mouse hover
     */
    setTooltipValue: function (value, themeUnit) {
        if (value === null || value === undefined || isNaN(Number(value))) {
            return "";
        }

        if (value.toString().indexOf(".") !== -1 && themeUnit !== "anteilWanderungen") {
            return (Math.round(value * 100) / 100).toString().replace(/\./g, ",") + "%";
        }
        else if (value.toString().indexOf(".") !== -1) {
            return (Math.round(value * 100) / 100).toString().replace(/\./g, ",");
        }

        return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
    },

    /**
     * Generates the graph config and triggers the Graph-functionality to create the graph
     * @returns {void}
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    createD3Document: function () {
        const width = parseInt($(".gfi-balkendiagramm").css("width"), 10),
            themeUnit = this.get("themeUnit"),
            setTooltipValue = this.setTooltipValue,
            themeId = this.get("themeId"),

            graphConfig = {
                graphType: "BarGraph",
                selector: ".graph_" + themeId,
                width: width - 10,
                height: 170,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 30,
                    left: 45
                },
                svgClass: "graph-svg",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                yAxisTicks: {
                    ticks: 5,
                    factor: ",f"
                },
                data: this.get("dataset"),
                xAttr: "year",
                xAxisLabel: {},
                yAxisLabel: {},

                attrToShowArray: [
                    "number"
                ],
                setTooltipValue: function (value) {
                    return setTooltipValue(value, themeUnit);
                }
            };

        // In case multi GFI themes come together, we need to clear the bar graph so that only one bar graph shows
        $(".graph_" + themeId + " svg").remove();

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    /**
     * requests util if portal is running on mobile device
     * @returns {Boolean} isMobile
     */
    checkIsMobile: function () {
        return Radio.request("Util", "isViewMobile");
    }
});

export default BalkendiagrammTheme;
