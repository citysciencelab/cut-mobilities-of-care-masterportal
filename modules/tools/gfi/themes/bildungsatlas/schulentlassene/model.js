import Theme from "../../model";

const SchulentlasseneTheme = Theme.extend({
    initialize: function () {
        const timeOut = this.checkIsMobile() ? 300 : 100;

        this.listenTo(this, {
            "change:isReady": function () {
                this.setTemplateValues();

                // as there is no way to write the graph with d3 into the template dom at this point (template is not applied yet), a simple timeout is used
                setTimeout(_.bind(this.createGraphZeitverlauf, this), timeOut);
                setTimeout(_.bind(this.createGraphAbschluesse, this), timeOut);
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
     * @pre no values are set
     * @post all necessary values for the template are set
     * @returns {void}
     */
    setTemplateValues: function () {
        const modelAttributeFilter = {isVisibleInMap: true, "gfiTheme": "schulentlassene", "id": this.get("themeId")};
        var element = this.get("gfiContent"),
            layerList,
            layerDataFormat;
        let idx = 0,
            key = "",
            realKey = "";

        // get the layer list by attributes from config file
        layerList = Radio.request("ModelList", "getModelsByAttributes", modelAttributeFilter);

        if (!layerList || layerList.length <= 0) {
            console.warn("bildungsatlas - schulentlassene: the layerList couldn't be set by attributes:", modelAttributeFilter);
        }

        layerDataFormat = layerList[0].get("format");

        if (!layerDataFormat || !layerDataFormat.layerType || !layerDataFormat.themeType) {
            this.set("layerType", false);
            this.set("themeType", false);
            console.warn("bildungsatlas - schulentlassene: the layerDataFormat does not exist or is set inappropriately:", layerDataFormat);
        }
        else if (layerDataFormat.layerType !== "stadtteil" && layerDataFormat.layerType !== "sozialraum") {
            this.set("layerType", false);
            this.set("themeType", false);
            console.warn("bildungsatlas - schulentlassene: the given layerDataFormat.layerType is unknown to the application:", layerDataFormat.layerType);
        }
        else if (layerDataFormat.themeType !== "Abi" && layerDataFormat.themeType !== "oHS") {
            this.set("layerType", false);
            this.set("themeType", false);
            console.warn("bildungsatlas - schulentlassene: the given layerDataFormat.themeType is unknown to the application:", layerDataFormat.themeType);
        }
        else {
            // set the layerType "stadtteil" or "sozialraum"
            this.set("layerType", layerDataFormat.layerType);
            // set the themeType "Abi" or "oHS" (oHS are pupils without graduation)
            this.set("themeType", layerDataFormat.themeType);
        }

        for (idx in element) {
            for (key in element[idx]) {
                // beautifyString in /modules/tools/gfi/themes/model.js removes the first "_" in key - so here we have to adjust the "realKey"
                realKey = key.replace(" ", "_");

                this.set(realKey, element[idx][key]);
            }
        }

        // set the value for data_zeitverlauf which is used for the BarGraph zeitverlauf
        if (this.get("themeType") === "Abi") {
            this.set("data_zeitverlauf", this.createDataForZeitverlauf("C41_Abi", "number"));
        }
        else {
            this.set("data_zeitverlauf", this.createDataForZeitverlauf("C41_oHS", "number"));
        }

        // set the value for data_abschluesse which is used for the Linegraph zeitverlauf
        this.set("data_abschluesse", this.createDataForAbschluesse());
    },

    /**
     * gets the legend for Linegraph abschluesse
     * @return {Array} an Array({class, style, text})
     */
    getLegendAbschluesse: function () {
        return [
            {class: "dotAbi", style: "circle", text: "Abi/FH: Abitur/Fachhochschulreife"},
            {class: "dotMSA", style: "circle", text: "MSA: mittlerer Schulabschluss"},
            {class: "dotESA", style: "circle", text: "ESA: erster allgemeinbildender Schulabschluss"},
            {class: "dotOSA", style: "circle", text: "oSA: ohne ersten allgemeinbildenden Schulabschluss"},
            {class: "dotALL", style: "circle", text: "Anzahl aller Schulentlassenen"}
        ];
    },

    /**
     * creates the data for multi line diagrams
     * @param {String} className the class name for the dot as defined in GraphConfig and CSS
     * @param {String} numberName the ref to the x axis name of the group as defined in GraphConfig
     * @param {Array} verlaufX an array as result from createDataForZeitverlauf
     * @param {Object} legendObj the result of getLegendAbschluesse but with its class parameter as property
     * @param {Array} verlaufALL an array to store values for all verlaufX data
     * @return {Array} the result is an array with objects [{class, style, year}]
     * @post the array verlaufALL may be larger and/or its values are counted up
     */
    helperCreateDataForAbschluesse: function (className, numberName, verlaufX, legendObj, verlaufALL) {
        var result = [],
            obj,
            i;

        for (i in verlaufX) {
            obj = {
                "class": className,
                "style": legendObj[className].style,
                "year": verlaufX[i].year
            };
            obj[numberName] = verlaufX[i][numberName];
            result.push(obj);

            if (!verlaufALL.hasOwnProperty(verlaufX[i].year)) {
                verlaufALL[verlaufX[i].year] = {
                    "numberALL": 0,
                    "class": "dotALL",
                    "style": legendObj.dotALL.style,
                    "year": verlaufX[i].year
                };
            }
            verlaufALL[verlaufX[i].year].numberALL += verlaufX[i][numberName];
        }

        return result;
    },

    /**
     * creates the data shaped for Linegraph
     * uses createDataForZeitverlauf to form the different lines
     * @return {Array} an array of objects as Array({year, number, class, style})
     */
    createDataForAbschluesse: function () {
        const legendArr = this.getLegendAbschluesse(),
            verlaufALL = {},
            legendObj = {};
        let result = [],
            i;

        for (i in legendArr) {
            legendObj[legendArr[i].class] = legendArr[i];
        }

        result = result.concat(this.helperCreateDataForAbschluesse("dotAbi", "numberAbi", this.createDataForZeitverlauf("C42_Abi", "numberAbi"), legendObj, verlaufALL));
        result = result.concat(this.helperCreateDataForAbschluesse("dotMSA", "numberMSA", this.createDataForZeitverlauf("C42_MSA", "numberMSA"), legendObj, verlaufALL));
        result = result.concat(this.helperCreateDataForAbschluesse("dotESA", "numberESA", this.createDataForZeitverlauf("C42_ESA", "numberESA"), legendObj, verlaufALL));
        result = result.concat(this.helperCreateDataForAbschluesse("dotOSA", "numberOSA", this.createDataForZeitverlauf("C42_oSA", "numberOSA"), legendObj, verlaufALL));

        for (i in verlaufALL) {
            result.push(verlaufALL[i]);
        }

        return result;
    },

    /**
     * creates an array of the statistic for the graph data tag
     * @param {String} tag part of the ifbq-key that is used for multiple year data (e.g. "C41_Abi" for "C41_Abi_2016", "C41_Abi_2017", ...)
     * @param {String} valueTag as used in graphConfig.attrToShowArray: name of the y-value
     * @return {Array} an array of Objects with the structure [{"year", valueTag}] to be used as graph data
     */
    createDataForZeitverlauf: function (tag, valueTag) {
        const showMax = 10,
            regEx = new RegExp("^" + tag + "_(\\d{4})$");
        var element = this.get("gfiContent");
        let result = [],
            regRes,
            year,
            obj,
            key;

        // creates an array [{"year", valueTag}] as result
        for (key in element.allProperties) {
            regRes = regEx.exec(key);
            if (regRes === null || !regRes[1]) {
                continue;
            }

            year = parseInt(regRes[1], 10);

            obj = {};
            // sort by a save and sound parameter
            obj.fullyear = year;
            // e.g. Schuljahr 2010 := "10/11"
            obj.year = year.toString().substr(2, 2) + "/" + (year + 1).toString().substr(2, 2);
            // for the statistic
            obj[valueTag] = parseFloat(this.get(key));
            // for calculation of dotALL
            obj.value = obj[valueTag];

            result.push(obj);
        }

        result = _.sortBy(result, "fullyear");

        // cut array to have only max. showMax values
        result = result.slice(Math.max(0, result.length - showMax));

        return result;
    },

    /**
     * creates the BarGraph zeitverlauf and triggers Graph createGraph
     * @returns {void}
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    createGraphZeitverlauf: function () {
        const graphConfig = {
            graphType: "BarGraph",
            selector: ".graph_zeitverlauf",
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
            data: this.get("data_zeitverlauf"),
            xAttr: "year",
            xAxisLabel: {
                "label": "Jahr"
            },
            yAxisLabel: {
                "label": "Anteil Schüler in Prozent",
                "offset": 40
            },
            attrToShowArray: [
                "number"
            ],
            setTooltipValue: function (value) {
                return Math.round(value).toString() + "%";
            }
        };

        if (_.isUndefined(this.get("data_zeitverlauf"))) {
            return;
        }

        Radio.trigger("Graph", "createGraph", graphConfig);
    },

    /**
     * creates the Linegraph abschluesse and triggers Graph createGraph
     * @returns {void}
     * @fires Tools.Graph#RadioTriggerGraphCreateGraph
     */
    createGraphAbschluesse: function () {
        const graphConfig = {
            legendData: this.getLegendAbschluesse(),
            graphType: "Linegraph",
            selector: ".graph_abschluesse",
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
            data: this.get("data_abschluesse"),
            xAttr: "year",
            xAxisLabel: {
                label: "Schuljahr",
                translate: 6
            },
            yAxisLabel: {
                label: "Abschlüsse je 1000 unter 18-Jährige",
                offset: 60
            },
            attrToShowArray: [
                {attrName: "numberAbi", attrClass: "lineAbi"},
                {attrName: "numberMSA", attrClass: "lineMSA"},
                {attrName: "numberESA", attrClass: "lineESA"},
                {attrName: "numberOSA", attrClass: "lineOSA"},
                {attrName: "numberALL", attrClass: "lineALL"}
            ]
        };

        if (_.isUndefined(this.get("data_abschluesse"))) {
            return;
        }

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

export default SchulentlasseneTheme;
