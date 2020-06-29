import Theme from "../../model";

const SchulentlasseneTheme = Theme.extend(/** @lends SchulentlasseneTheme.prototype */{
    defaults: Object.assign({}, Theme.prototype.defaults, {
        warningPrefix: "Regionaler Bildungsatlas - Schulentlassene ",
        maxYearsToShowInDiagrams: 10,

        attrToShowArrayZeitverlauf: [
            "number"
        ],

        attrToShowArrayAbschluesse: [
            {attrName: "numberAbi", attrClass: "lineAbi"},
            {attrName: "numberMSA", attrClass: "lineMSA"},
            {attrName: "numberESA", attrClass: "lineESA"},
            {attrName: "numberOSA", attrClass: "lineOSA"},
            {attrName: "numberALL", attrClass: "lineALL"}
        ],

        // the class should be designed in style.css
        legendAbschluesse: [
            {class: "dotAbi", style: "circle", text: "Abi/FH: Abitur/Fachhochschulreife"},
            {class: "dotMSA", style: "circle", text: "MSA: mittlerer Schulabschluss"},
            {class: "dotESA", style: "circle", text: "ESA: erster allgemeinbildender Schulabschluss"},
            {class: "dotOSA", style: "circle", text: "oSA: ohne ersten allgemeinbildenden Schulabschluss"},
            {class: "dotALL", style: "circle", text: "Anzahl aller Schulentlassenen"}
        ],

        // ifbq stands for "Institut für Bildungsmonitoring und Qualitätsentwicklung" (https://www.hamburg.de/bsb/ifbq/)
        // prefix is the part of a key following a year - e.g. C41_Abi stands for C41_Abi_2017, C41_Abi_2018, ...
        ifbqKeys: {
            "relative": {
                "Abi": {prefix: "C41_Abi", attrToShowArray: "number", refLegendClass: ""},
                "oHS": {prefix: "C41_oHS", attrToShowArray: "number", refLegendClass: ""}
            },
            "absolute": {
                "Abi": {prefix: "C42_Abi", attrToShowArray: "numberAbi", refLegendClass: "dotAbi"},
                "MSA": {prefix: "C42_MSA", attrToShowArray: "numberMSA", refLegendClass: "dotMSA"},
                "ESA": {prefix: "C42_ESA", attrToShowArray: "numberESA", refLegendClass: "dotESA"},
                "oHS": {prefix: "C42_oSA", attrToShowArray: "numberOSA", refLegendClass: "dotOSA"}
            }
        },

        // default values to be set for the template
        themeType: "",
        layerType: "",
        ST_Name: "",
        SR_Name: "",
        C41_Abi: "",
        C41_RS: "",
        C41_mHS: "",
        C41_oHS: "",
        C41_Abi_B: "",
        C41_RS_B: "",
        C41_mHS_B: "",
        C41_oHS_B: "",
        C41_Abi_FHH: "",
        C41_RS_FHH: "",
        C41_mHS_FHH: "",
        C41_oHS_FHH: "",
        themeId: 0,
        dataZeitverlauf: [],
        dataAbschluesse: []
    }),

    /**
     * @class SchulentlasseneTheme
     * @extends Backbone.Model
     * @memberof Tools.Gfi.Themes.Bildungsatlas
     * @constructs
     */
    initialize: function () {
        this.listenTo(this, {
            "change:isReady": function () {
                const layerList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, "gfiTheme": this.get("gfiTheme"), "id": this.get("themeId")}),
                    gfiFormat = layerList[0].get("gfiFormat");

                if (!gfiFormat || !gfiFormat.hasOwnProperty("gfiBildungsatlasFormat")) {
                    console.warn("Regionaler Bildungsatlas Schulentlassene - initialize: gfiFormat expects to have a key 'gfiBildungsatlasFormat' but has none:", gfiFormat);
                    return;
                }

                this.setTemplateValues(this.get("gfiContent").allProperties, this.get("legendAbschluesse"), this.get("maxYearsToShowInDiagrams"), this.get("ifbqKeys").relative, this.get("ifbqKeys").absolute, gfiFormat.gfiBildungsatlasFormat);
            },
            "change:isVisible": function (model, isVisible) {
                const timeOut = this.checkIsMobile() ? 300 : 100;

                if (isVisible) {
                    // as there seems to be currently no way to write the graph with d3 into the template dom at this point (template is not applied yet), a simple timeout is used instead of a pure solution
                    setTimeout(this.createGraphZeitverlauf.bind(this), timeOut);
                    setTimeout(this.createGraphAbschluesse.bind(this), timeOut);
                }
            }
        });

        // render gfi new when changing properties of the associated features
        this.listenTo(Radio.channel("schulentlasseneTheme"), {
            "changeGfi": function () {
                Radio.trigger("gfiView", "render");
            }
        });
    },

    /**
     * sets the values for the template
     * the values from the source are used as they are - only themeType and layerType are added for schulentlassene
     * @param {Object} gfiProperties - the given data for this theme gotten by this.get("gfiContent").allProperties
     * @param {Array} legendArray the result of defaults legendAbschluesse
     * @param {Integer} maxYearsToShowInDiagrams the maximum years/bars/points to be shown on the x-axis
     * @param {Object} ifbqKeysRelative the ifbq-Keys for the BarGraph (percent) - see defaults
     * @param {Object} ifbqKeysAbsolute the ifbq-Keys for the Linegraph (absolute) - see defaults
     * @param {Object} gfiBildungsatlasFormat an object {layerType, themeType} from config.json to control the behavior of the theme - search for keys gfiFormat and gfiBildungsatlasFormat
     * @pre no values are set
     * @post all necessary values for the template are set
     * @returns {void}  -
     */
    setTemplateValues: function (gfiProperties, legendArray, maxYearsToShowInDiagrams, ifbqKeysRelative, ifbqKeysAbsolute, gfiBildungsatlasFormat) {
        let key;

        if (!gfiBildungsatlasFormat || !gfiBildungsatlasFormat.hasOwnProperty("layerType") || !gfiBildungsatlasFormat.hasOwnProperty("themeType")) {
            console.warn("Regionaler Bildungsatlas Schulentlassene - setTemplateValues: gfiBildungsatlasFormat does not exist or is set inappropriately:", gfiBildungsatlasFormat);
        }
        else if (gfiBildungsatlasFormat.layerType !== "stadtteil" && gfiBildungsatlasFormat.layerType !== "sozialraum") {
            console.warn("Regionaler Bildungsatlas Schulentlassene - setTemplateValues: the given gfiBildungsatlasFormat.layerType is unknown to the application:", gfiBildungsatlasFormat.layerType);
        }
        else if (gfiBildungsatlasFormat.themeType !== "Abi" && gfiBildungsatlasFormat.themeType !== "oHS") {
            console.warn("Regionaler Bildungsatlas Schulentlassene - setTemplateValues: the given gfiBildungsatlasFormat.themeType is unknown to the application (1):", gfiBildungsatlasFormat.themeType);
        }
        else {
            // set the layerType "stadtteil" or "sozialraum"
            this.set("layerType", gfiBildungsatlasFormat.layerType);
            // set the themeType "Abi" or "oHS" (oHS are pupils without graduation)
            this.set("themeType", gfiBildungsatlasFormat.themeType);
        }

        for (key in gfiProperties) {
            this.set(key, gfiProperties[key]);
        }

        // set the value for dataZeitverlauf which is used for the BarGraph zeitverlauf
        if (gfiBildungsatlasFormat && gfiBildungsatlasFormat.hasOwnProperty("themeType") && ifbqKeysRelative.hasOwnProperty(gfiBildungsatlasFormat.themeType)) {
            this.set("dataZeitverlauf", this.createDataForZeitverlauf(gfiProperties, ifbqKeysRelative[gfiBildungsatlasFormat.themeType].prefix, ifbqKeysRelative[gfiBildungsatlasFormat.themeType].attrToShowArray, maxYearsToShowInDiagrams));
        }
        else {
            console.warn("Regionaler Bildungsatlas Schulentlassene - setTemplateValues: the given gfiBildungsatlasFormat.themeType is unknown to the application or can't be found in ifbqKeysRelative:", gfiBildungsatlasFormat, ifbqKeysRelative);
        }

        this.set("dataAbschluesse", this.createDataForAbschluesse(gfiProperties, legendArray, maxYearsToShowInDiagrams, ifbqKeysAbsolute));
    },

    /**
     * creates the data for multi line diagrams
     * @param {String} className the class name for the dot as defined in GraphConfig and CSS
     * @param {String} numberName the ref to the x axis name of the group as defined in GraphConfig
     * @param {Array} verlaufX an array as result from createDataForZeitverlauf
     * @param {Object} legendObj the result of defaults legendAbschluesse but with its class parameter as property
     * @param {Array} verlaufAll an array to store values for all verlaufX data
     * @returns {Array}  - the result is an array with objects [{class, style, year}]
     * @post the array verlaufAll may be larger and/or its values are counted up
     */
    helperCreateDataForAbschluesse: function (className, numberName, verlaufX, legendObj, verlaufAll) {
        const result = [];

        if (!legendObj.hasOwnProperty(className) || !legendObj.hasOwnProperty("dotALL")) {
            return result;
        }

        verlaufX.forEach(function (atomX) {
            const obj = {
                "class": className,
                "style": legendObj[className].style,
                "year": atomX.year
            };

            if (!atomX.hasOwnProperty(numberName)) {
                return;
            }

            obj[numberName] = atomX[numberName];
            result.push(obj);

            if (!verlaufAll.hasOwnProperty(atomX.year)) {
                verlaufAll[atomX.year] = {
                    "numberALL": 0,
                    "class": "dotALL",
                    "style": legendObj.dotALL.style,
                    "year": atomX.year
                };
            }
            verlaufAll[atomX.year].numberALL += atomX[numberName];
        });

        return result;
    },

    /**
     * creates the data shaped for Linegraph
     * uses createDataForZeitverlauf to form the different lines
     * @param {Object} gfiProperties - the given data for this theme gotten by this.get("gfiContent").allProperties
     * @param {Array} legendArray the result of defaults legendAbschluesse
     * @param {Integer} maxYearsToShowInDiagrams the maximum years/bars/points to be shown on the x-axis
     * @param {Object} ifbqKeysAbsolute the ifbq-Keys for the Linegraph (absolute) - see defaults
     * @returns {Array}  - an array of objects as Array({year, number, class, style})
     */
    createDataForAbschluesse: function (gfiProperties, legendArray, maxYearsToShowInDiagrams, ifbqKeysAbsolute) {
        const verlaufAll = {},
            legendObj = {};
        let result = [],
            key,
            verlaufX;

        // create legendObj having the class attribute as its key
        legendArray.forEach(function (atom) {
            legendObj[atom.class] = atom;
        });

        for (key in ifbqKeysAbsolute) {
            verlaufX = this.createDataForZeitverlauf(gfiProperties, ifbqKeysAbsolute[key].prefix, ifbqKeysAbsolute[key].attrToShowArray, maxYearsToShowInDiagrams);
            result = result.concat(this.helperCreateDataForAbschluesse(ifbqKeysAbsolute[key].refLegendClass, ifbqKeysAbsolute[key].attrToShowArray, verlaufX, legendObj, verlaufAll));
        }

        // adding aggregated overall data into result
        for (key in verlaufAll) {
            result.push(verlaufAll[key]);
        }

        return result;
    },

    /**
     * creates an array of the statistic for the graph data tag
     * @param {Object} gfiProperties - the given data for this theme gotten by this.get("gfiContent").allProperties
     * @param {String} tag part of the ifbq-key that is used for multiple year data (e.g. "C41_Abi" for "C41_Abi_2016", "C41_Abi_2017", ...)
     * @param {String} valueTag as used in graphConfig.attrToShowArray: name of the y-value
     * @param {Integer} maxYearsToShowInDiagrams the maximum years/bars/points to be shown on the x-axis
     * @returns {Array}  - an array of Objects with the structure [{"year": x, valueTag: y}] to be used as graph data
     */
    createDataForZeitverlauf: function (gfiProperties, tag, valueTag, maxYearsToShowInDiagrams) {
        const regEx = new RegExp("^" + tag + "_(\\d{4})$");
        let result = [],
            regRes,
            year,
            obj,
            key;

        if (!tag) {
            // no or an empty tag should not be computed
            return result;
        }

        // creates result as an array [{"year", valueTag}]
        for (key in gfiProperties) {
            regRes = regEx.exec(key);
            if (regRes === null || !regRes[1]) {
                continue;
            }

            year = parseInt(regRes[1], 10);

            obj = {};
            // to sort by a save and sound parameter
            obj.fullyear = year;
            // e.g. Schuljahr 2010 := "10/11"
            obj.year = year.toString().substr(2, 2) + "/" + (year + 1).toString().substr(2, 2);
            // for the statistic
            obj[valueTag] = parseFloat(gfiProperties[key]);
            // for the calculation of dotALL
            obj.value = obj[valueTag];

            result.push(obj);
        }

        result.sort((valueA, valueB) => valueA.fullyear - valueB.fullyear);

        // cut array to have only max. maxYearsToShowInDiagrams values
        result = result.slice(Math.max(0, result.length - maxYearsToShowInDiagrams));

        return result;
    },

    /**
     * creates the BarGraph zeitverlauf and triggers Graph createGraph
     * @returns {void}  -
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    createGraphZeitverlauf: function () {
        const themeId = this.get("themeId"),
            graphConfig = {
                graphType: "BarGraph",
                selector: ".graph_zeitverlauf_" + themeId,
                width: parseInt($(".schulentlassene-gfi-theme").css("width"), 10) - 10,
                height: 190,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 40,
                    left: 40
                },
                svgClass: "graph-svg",
                selectorTooltip: ".graph-tooltip-div",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                yAxisTicks: {
                    ticks: 5,
                    factor: ",f"
                },
                data: this.get("dataZeitverlauf"),
                xAttr: "year",
                xAxisLabel: {
                    "label": "Jahr"
                },
                yAxisLabel: {
                    "label": "Anteil Schüler in Prozent",
                    "offset": 40
                },
                attrToShowArray: this.get("attrToShowArrayZeitverlauf"),
                setTooltipValue: function (value) {
                    return Math.round(value).toString() + "%";
                }
            };

        // In case multi GFI themes come together, we need to clear the bar graph so that only one bar graph shows
        $(".graph_zeitverlauf_" + themeId + " svg").remove();

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    /**
     * creates the Linegraph abschluesse and triggers Graph createGraph
     * @returns {void}  -
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    createGraphAbschluesse: function () {
        const themeId = this.get("themeId"),
            graphConfig = {
                legendData: this.get("legendAbschluesse"),
                graphType: "Linegraph",
                selector: ".graph_abschluesse_" + themeId,
                width: parseInt($(".schulentlassene-gfi-theme").css("width"), 10) - 10,
                height: 370,
                margin: {
                    top: 20,
                    right: 20,
                    bottom: 140,
                    left: 70
                },
                svgClass: "graph-svg",
                selectorTooltip: ".graph-tooltip-div",
                scaleTypeX: "ordinal",
                scaleTypeY: "linear",
                yAxisTicks: {
                    ticks: 5,
                    factor: ",f"
                },
                data: this.get("dataAbschluesse"),
                xAttr: "year",
                xAxisLabel: {
                    label: "Schuljahr",
                    translate: 6
                },
                yAxisLabel: {
                    label: "Abschlüsse je 1000 unter 18-Jährige",
                    offset: 60
                },
                attrToShowArray: this.get("attrToShowArrayAbschluesse"),
                setTooltipValue: function (value) {
                    return (Math.round(value * 100) / 100).toString().replace(/\./g, ",");
                }
            };

        // In case multi GFI themes come together, we need to clear the bar graph so that only one bar graph shows
        $(".graph_abschluesse_" + themeId + " svg").remove();

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    /**
     * requests util if portal is running on mobile device
     * @returns {Boolean}  - isMobile
     */
    checkIsMobile: function () {
        return Radio.request("Util", "isViewMobile");
    }
});

export default SchulentlasseneTheme;
