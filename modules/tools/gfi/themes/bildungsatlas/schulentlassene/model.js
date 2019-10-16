import Theme from "../../model";
import RoutableView from "../../../objects/routingButton/view";

const SchulentlasseneTheme = Theme.extend({
    initialize: function () {
        let timeOut = (this.checkIsMobile()) ? 300 : 100;

        this.listenTo(this, {
            "change:isReady": function () {
                this.setTemplateValues();

                // as there is no way to write the graph with d3 into the template dom at this point (template is not applied yet), a timeout is used
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
        var element = this.get("gfiContent"),
            layerId = this.get("themeId");
        let idx = 0,
            key = "",
            realKey = "";

        // set the themeType "Abi" or "oHS" (oHS are pupils without graduation)
        if (layerId == "90033" || layerId == "90034") {
            this.set("themeType", "Abi");
        } else if (layerId == "90035" || layerId == "90036") {
            this.set("themeType", "oHS");
        } else {
            console.warn("bildungsatlas - schulentlassene: the layerId " + layerId + " is unknown to the application (1)");
            this.set("themeType", false);
        }

        // set the layerType "stadtteil" or "sozialraum"
        if (layerId == "90033" || layerId === "90035") {
            this.set("layerType", "stadtteil");
        } else if (layerId == "90034" || layerId === "90036") {
            this.set("layerType", "sozialraum");
        } else {
            console.warn("bildungsatlas - schulentlassene: the layerId " + layerId + " is unknown to the application (2)");
            this.set("layerType", false);
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
        } else {
            this.set("data_zeitverlauf", this.createDataForZeitverlauf("C41_oHS", "number"));
        }

        // set the value for data_abschluesse which is used for the Linegraph zeitverlauf
        this.set("data_abschluesse", this.createDataForAbschluesse());

        return;
    },

    /**
     * gets the legend for Linegraph abschluesse
     * @return {Array} an Array({class, style, text})
     */
    getLegendAbschluesse: function(){
        return [
            {class: "dotAbi", style: "circle", text: "Abi/FH: Abitur/Fachhochschulreife"},
            {class: "dotMSA", style: "circle", text: "MSA: mittlerer Schulabschluss"},
            {class: "dotESA", style: "circle", text: "ESA: erster allgemeinbildender Schulabschluss"},
            {class: "dotOSA", style: "circle", text: "oSA: ohne ersten allgemeinbildenden Schulabschluss"},
            {class: "dotALL", style: "circle", text: "Anzahl aller Schulentlassenen"}
        ];
    },

    /**
     * creates the data shaped for Linegraph
     * uses createDataForZeitverlauf to form the different lines
     * @return {Array} an array of objects as Array({year, number, class, style})
     */
    createDataForAbschluesse: function(){
        let verlaufAbi = this.createDataForZeitverlauf("C42_Abi", "numberAbi"),
            verlaufMSA = this.createDataForZeitverlauf("C42_MSA", "numberMSA"),
            verlaufESA = this.createDataForZeitverlauf("C42_ESA", "numberESA"),
            verlaufOSA = this.createDataForZeitverlauf("C42_oSA", "numberOSA"),
            verlaufALL = {},
            legendeArr = this.getLegendAbschluesse(),
            legendeAssoc = {},
            result = [],
            obj = {},
            i,
            x;

        for (i in legendeArr) {
            legendeAssoc[legendeArr[i]["class"]] = legendeArr[i];
        }

        var helperAtomDataCreator = function(className, numberName, verlaufX, legendeAssoc, verlaufALL){
            var result = [],
            obj,
            i;
            for (i in verlaufX) {
                obj = {
                    "class": className,
                    "style": legendeAssoc[className].style,
                    "year": verlaufX[i].year
                }
                obj[numberName] = verlaufX[i][numberName];
                result.push(obj);
    
                if (!verlaufALL.hasOwnProperty(verlaufX[i].year)) {
                    verlaufALL[verlaufX[i].year] = {
                        "numberALL": 0,
                        "class": "dotALL",
                        "style": legendeAssoc["dotALL"].style,
                        "year": verlaufX[i].year
                    };
                }
                verlaufALL[verlaufX[i].year].numberALL+= verlaufX[i][numberName];
            }
            return result;
        };

        result = result.concat(helperAtomDataCreator("dotAbi", "numberAbi", verlaufAbi, legendeAssoc, verlaufALL));
        result = result.concat(helperAtomDataCreator("dotMSA", "numberMSA", verlaufMSA, legendeAssoc, verlaufALL));
        result = result.concat(helperAtomDataCreator("dotESA", "numberESA", verlaufESA, legendeAssoc, verlaufALL));
        result = result.concat(helperAtomDataCreator("dotOSA", "numberOSA", verlaufOSA, legendeAssoc, verlaufALL));

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
    createDataForZeitverlauf: function( tag, valueTag ){
        const depthBarrierYear = 2010,
            thisYear = (new Date()).getFullYear(),
            showMax = 10;
        let i = 0,
            n = 0,
            relevantData = [],
            result = [],
            year,
            obj;

        // creates an array [{"year", valueTag}] as result
        year = depthBarrierYear;
        while(year <= thisYear){
            if (typeof this.get(tag + "_" + year) !== "undefined") {
                obj = {};
                obj["fullyear"] = year;
                
                // e.g. Schuljahr 2010 := "10/11"
                obj["year"] = year.toString().substr(2,2) + "/" + (year+1).toString().substr(2,2);
                
                // for the statistic
                obj[valueTag] = parseFloat(this.get(tag + "_" + year));
                
                // for calculation of dotALL
                obj["value"] = obj[valueTag];

                result.push(obj);
            }
            year++;
        }

        result = _.sortBy(result, "fullyear");

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
            height: 170,
            margin: {
                top: 20,
                right: 20,
                bottom: 20,
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
            xAxisLabel: {},
            yAxisLabel: {},
            attrToShowArray: [
                "number"
            ],
            setTooltipValue: function(value){
                return Math.round(value).toString() + "%";
            }
        };

        if(typeof this.get("data_zeitverlauf") === "undefined"){
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
