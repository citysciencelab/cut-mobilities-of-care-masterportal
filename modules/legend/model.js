import Feature from "ol/Feature.js";
import Tool from "../core/modelList/tool/model";
import WMTSLayer from "../core/modelList/layer/wmts";

const LegendModel = Tool.extend(/** @lends LegendModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        legendParams: [],
        paramsStyleWMS: [],
        paramsStyleWMSArray: [],
        renderToWindow: false,
        renderToSidebar: false,
        keepOpen: true,
        glyphicon: "glyphicon-book",
        rotationAngle: 0,
        startX: 0,
        startY: 0,
        windowLeft: 0,
        windowTop: 0,
        currentLng: "",
        showCollapseAllButton: false
    }),

    /**
     * @class LegendModel
     * @extends Core.ModelList.Tool
     * @memberof Legend
     * @constructs
     * @property {Array} legendParams Array of legend parameters,
     * @property {Array} paramsStyleWMS todo
     * @property {Array} paramsStyleWMSArray todo
     * @property {Boolean} renderToWindow=false Flag, if the legend shall render to a window
     * @property {Boolean} renderToSidebar=false Flag, if the legend shall render to the sidebar
     * @property {String} glyphicon="glyphicon-book" Icon to user for Legend-Menu-Entry
     * @listens Legend#RadioRequestLegendGetLegend
     * @listens Legend#RadioRequestLegendGetLegendParams
     * @listens Legend#RadioTriggerLegendSetLayerList
     * @listens Legend#changeParamsStyleWMSArray
     * @listens Core.ModelList#RadioTriggerModelListUpdatedSelectedLayerList
     * @listens StyleWMS#RadioTriggerStyleWmsUpdateParamsStyleWMS
     * @listens StyleWMS#RadioTriggerStyleWmsResetParamsStyleWMS
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @fires Legend#changeLegendParams
     * @fires Legend#changeParamsStyleWMSArray
     */
    initialize: function () {
        const channel = Radio.channel("Legend");

        this.superInitialize();
        channel.reply({
            "getLegend": this.getLegend,
            "getLegendParams": function () {
                return this.get("legendParams");
            }
        }, this);
        channel.on({
            "setLayerList": this.setLayerList
        }, this);
        this.listenTo(Radio.channel("Map"), {
            "change": this.setLayerList
        });
        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.setLayerList
        });
        this.listenTo(Radio.channel("StyleWMS"), {
            "updateParamsStyleWMS": this.updateParamsStyleWMSArray,
            "resetParamsStyleWMS": this.resetParamsStyleWMSArray
        });
        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });
        this.changeLang(i18next.language);
        this.listenTo(this, {
            "change:paramsStyleWMSArray": this.updateLegendFromStyleWMSArray
        });
        this.listenTo(Radio.channel(WMTSLayer), {
            "change:legendURL": this.setLayerList
        });

    },

    /**
     * Creates the legend information for one layer and returns it
     * @param  {Object} layer requested layer
     * @return {Object} returns legend information
     */
    getLegend: function (layer) {
        const layerSources = layer.get("layerSource"); // Array oder undefined

        return this.getLegendDefinition(layer.get("name"), layer.get("typ"), layer.get("legendURL"), layer.get("styleId"), layerSources);
    },
    /**
    * todo
    * @param {*} params todo
    * @returns {void}
    */
    updateParamsStyleWMSArray: function (params) {
        const paramsStyleWMSArray2 = this.copyOtherParamsStyleWMS(params.styleWMSName);

        paramsStyleWMSArray2.push(params);
        this.set("paramsStyleWMS", params);
        this.set("paramsStyleWMSArray", paramsStyleWMSArray2);
    },
    /**
    * todo
    * @param {*} nameOfLayerToExclude todo
    * @returns {Array} returns paramsStyleWMS
    */
    copyOtherParamsStyleWMS: function (nameOfLayerToExclude) {
        const paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
            paramsStyleWMSArray2 = [];

        paramsStyleWMSArray.forEach(function (paramsStyleWMS) {
            if (nameOfLayerToExclude !== paramsStyleWMS.styleWMSName) {
                paramsStyleWMSArray2.push(paramsStyleWMS);
            }
        });

        return paramsStyleWMSArray2;
    },
    /**
    * todo
    * @param {*} layer todo
    * @returns {void}
    */
    resetParamsStyleWMSArray: function (layer) {
        // Remove custom style from paramsStyleWMSArray
        this.set("paramsStyleWMSArray", this.copyOtherParamsStyleWMS(layer.get("name")));

        // Update legendParams: Replace legend for custom style with legend from legendURL
        const legendParams = this.get("legendParams");

        this.get("legendParams").forEach(function (legendParam, i) {

            if (legendParam.layername === layer.get("name")) {

                legendParams.splice(i, 1, {
                    layername: legendParam.layername,
                    typ: "WMS",
                    isVisibleInMap: legendParam.isVisibleInMap,
                    img: layer.get("legendURL")
                });
            }
        });

        this.set("legendParams", legendParams);
        this.setLayerList();
    },
    /**
    * todo
    * @returns {void}
    */
    updateLegendFromStyleWMSArray: function () {
        const paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
            legendParams = this.get("legendParams");

        this.get("legendParams").forEach(function (legendParam, i) {
            paramsStyleWMSArray.forEach(paramsStyleWMS => {
                let layername,
                    isVisibleInMap;

                if (legendParam.layername === paramsStyleWMS.styleWMSName) {
                    layername = legendParam.layername;
                    isVisibleInMap = legendParam.isVisibleInMap;

                    legendParams.splice(i, 1, {params: paramsStyleWMS,
                        layername: layername,
                        typ: "styleWMS",
                        isVisibleInMap: isVisibleInMap});

                }
            });
        });
        this.set("legendParams", legendParams);
        this.setLayerList();
    },
    /**
    * Sets the legend information for all visible layers
    * @returns {void}
    */
    setLayerList: function () {
        const layers = this.filterLayersForLegend(),
            tempArray = [];

        layers.forEach(layer => {
            tempArray.push(this.getLegendDefinition(layer.get("name"), layer.get("typ"), layer.get("legendURL"), layer.get("styleId"), layer.get("layerSource")));
        });

        this.unset("legendParams");
        this.set("legendParams", tempArray);
    },

    /**
     * Returns sorted and filtered layer list for legend.
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Core#RadioTriggerMapChange
     * @returns {Layer[]} sorted and filtered layers
     */
    filterLayersForLegend: function () {
        const visibleLayers = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, isOutOfRange: false}),
            filteredLegendUrl = this.filterLegendUrl(visibleLayers),
            isMode3D = Radio.request("Map", "isMap3d"),
            filterViewType = filteredLegendUrl.filter(layer => {
                return (isMode3D && layer.get("supported").includes("3D")) || (!isMode3D && layer.get("supported").includes("2D"));
            });

        return filterViewType.sort((layerA, layerB) => layerB.get("selectionIDX") - layerA.get("selectionIDX"));
    },

    /**
     * Filters out layers where the legend should not be shown.
     * @param {Backbone.Model[]} [visibleLayers=[]] - The visible layers.
     * @returns {Backbone.Model[]} The filtered layers.
     */
    filterLegendUrl: function (visibleLayers = []) {
        return visibleLayers.filter(layer => {
            if (layer.get("typ") === "GROUP") {
                return layer.get("layerSource").filter(childLayer => ["ignore", ""].indexOf(childLayer.get("legendURL")) === -1);
            }

            return ["ignore", ""].indexOf(layer.get("legendURL")) === -1;
        });
    },

    /**
    * Checks the layer and returns the layer definition
    * @param {String} layername         name of the layer
    * @param {String} typ               type of the layer
    * @param {String[]} [legendURL]     only if typ !== GROUP
    * @param {String} [styleId]         only if typ === WFS
    * @param {Object[]} [layerSources]  only if typ === GROUP
    * @returns {Object} returns legend definition
    */
    getLegendDefinition: function (layername, typ, legendURL, styleId, layerSources) {
        const defs = [],
            /**
             * Selector for old or new way to set vector legend
             * @deprecated with new vectorStyle module
             * @type {Boolean}
             */
            isNewVectorStyle = Config.hasOwnProperty("useVectorStyleBeta") && Config.useVectorStyleBeta ? Config.useVectorStyleBeta : false;

        if (legendURL === "ignore") {
            return {
                layername: layername,
                legend: null
            };
        }
        else if (typ === "WMS") {
            return this.getLegendParamsFromWMS(layername, legendURL);
        }
        else if (legendURL !== null && typ === "WMTS") {
            return this.getLegendParamsFromURL(layername, legendURL, typ);
        }
        else if (typ === "WFS") {
            if (isNewVectorStyle) {
                return this.getLegendParamsFromVector(layername, styleId, legendURL);
            }
            return this.getLegendParamsFromVectorOld(layername, styleId, legendURL);
        }
        else if (typ === "SensorThings") {
            if (isNewVectorStyle) {
                return this.getLegendParamsFromVector(layername, styleId, legendURL);
            }
            return this.getLegendParamsFromVectorOld(layername, styleId, legendURL);
        }
        else if (typ === "GeoJSON") {
            if (isNewVectorStyle) {
                return this.getLegendParamsFromVector(layername, styleId, legendURL);
            }
            return this.getLegendParamsFromVectorOld(layername, styleId, legendURL);
        }
        else if (typ === "StaticImage") {
            return this.getLegendParamsFromURL(layername, legendURL, typ);
        }
        else if (typ === "GROUP") {
            layerSources.forEach(function (layerSource) {
                const childLegend = this.getLegendDefinition(layerSource.get("name"), layerSource.get("typ"), layerSource.get("legendURL"), layerSource.get("styleId"), null);

                if (childLegend.legend) {
                    defs.push(childLegend.legend[0]);
                }
            }, this);

            return {
                layername: layername,
                legend: defs
            };
        }
        return {
            layername: layername,
            legend: null
        };
    },

    /**
     * Creates legend object by url
     * @param   {string} layername Name of layer to use in legend view
     * @param   {string[]} [legendURL] URL of image
     * @param   {string} typ type layertype
     * @returns {object} legendObject legend item
     */
    getLegendParamsFromURL: function (layername, legendURL, typ) {
        return {
            layername: layername,
            legend: [{
                img: legendURL,
                typ: typ
            }]
        };
    },

    /**
     * Creates legend object for WMS
     * @param   {string} layername Name of layer to use in legend view
     * @param   {string[]} [legendURL] URL of image
     * @returns {object} legendObject legend item
     */
    getLegendParamsFromWMS: function (layername, legendURL) {
        const paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
            paramsStyleWMS = paramsStyleWMSArray.find(function (params) {
                let bol;

                if (layername === params.styleWMSName) {
                    bol = true;
                }
                return bol;
            });

        if (paramsStyleWMS) {
            return {
                layername: layername,
                legend: [{
                    typ: "styleWMS",
                    params: paramsStyleWMS
                }]
            };
        }
        return this.getLegendParamsFromURL(layername, legendURL, "WMS");
    },

    /**
     * Creates legend object for vector layer using it's style
     * @deprecated with new vectorStyle module
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @param   {string} layername Name of layer to use in legend view
     * @param   {number} styleId styleId
     * @param   {string} legendURL can be an image path as string or array of strings
     * @returns {object} legendObject legend item
     * @returns {string} legendObject.legendname layername
     * @returns {object[]} legendObject.legend Array of legend entries in this particular layer e.g. because of multiple categories
     * @returns {string} legendObject.legend.legendname name of legend entry
     * @returns {string} legendObject.legend.img svg
     * @returns {string} legendObject.legend.typ=svg fixed type
     */
    getLegendParamsFromVectorOld: function (layername, styleId, legendURL) {
        let subLegend;

        if (!Radio.request("StyleList", "returnModelById", styleId)) {
            console.warn("Missing style for styleId " + styleId);

            return {
                layername: layername,
                legend: [{
                    legendname: [],
                    img: [],
                    typ: "svg"
                }]
            };
        }

        if (typeof legendURL === "string") {
            return {
                layername: layername,
                legend: [{
                    legendname: [],
                    img: legendURL,
                    typ: "png"
                }]
            };
        }

        const style = Radio.request("StyleList", "returnModelById", styleId).clone(),
            styleClass = style.get("class"),
            styleSubClass = style.get("subClass"),
            styleFieldValues = style.get("styleFieldValues"),
            image = [],
            name = [];

        if (styleClass === "POINT") {
            // Custom Point Styles
            if (styleSubClass === "CUSTOM") {
                styleFieldValues.forEach(styleFieldValue => {
                    const subStyle = style.clone();

                    // overwrite style with all styleFieldValue settings
                    for (const key in styleFieldValue) {
                        subStyle.set(key, styleFieldValue[key]);
                    }

                    subLegend = this.getLegendParamsForPointOld("", layername, subStyle);
                    if (!image.includes(subLegend.svg) || !name.includes(subLegend.name)) {
                        image.push(subLegend.svg);
                        name.push(subLegend.name);
                    }
                });
            }
            else {
                subLegend = this.getLegendParamsForPointOld(styleSubClass, layername, style);

                if (Array.isArray(subLegend.name) && Array.isArray(subLegend.svg)) {
                    if (!image.includes(subLegend.svg) || !name.includes(subLegend.name)) {
                        image.push(subLegend.svg);
                        name.push(subLegend.name);
                    }
                }
                else if (!image.includes(subLegend.svg) || !name.includes(subLegend.name)) {
                    image.push(subLegend.svg);
                    name.push(subLegend.name);
                }
            }
        }
        else if (styleClass === "LINE") {
            // Custom Point Styles
            if (styleFieldValues) {
                styleFieldValues.forEach(styleFieldValue => {
                    const subStyle = style.clone();

                    // overwrite style with all styleFieldValue settings
                    for (const key in styleFieldValue) {
                        subStyle.set(key, styleFieldValue[key]);
                    }
                    subLegend = this.getLegendParamsForLinesOld(layername, subStyle);
                    if (!image.includes(subLegend.svg) || !name.includes(subLegend.name)) {
                        image.push(subLegend.svg);
                        name.push(subLegend.name);
                    }
                });
            }
            else {
                subLegend = this.getLegendParamsForLinesOld(layername, style);
                if (!image.includes(subLegend.svg) || !name.includes(subLegend.name)) {
                    image.push(subLegend.svg);
                    name.push(subLegend.name);
                }
            }
        }
        else if (styleClass === "POLYGON") {
            // Custom Point Styles
            if (styleSubClass === "CUSTOM") {
                styleFieldValues.forEach(styleFieldValue => {
                    const subStyle = style.clone();

                    // overwrite style with all styleFieldValue settings
                    for (const key in styleFieldValue) {
                        subStyle.set(key, styleFieldValue[key]);
                    }
                    subLegend = this.getLegendParamsForPolygonsOld(layername, subStyle);

                    if (!image.includes(subLegend.svg) || !name.includes(subLegend.name)) {
                        image.push(subLegend.svg);
                        name.push(subLegend.name);
                    }
                });
            }
            else {
                subLegend = this.getLegendParamsForPolygonsOld(layername, style);

                if (!image.includes(subLegend.svg) || !name.includes(subLegend.name)) {
                    image.push(subLegend.svg);
                    name.push(subLegend.name);
                }
            }
        }

        return {
            layername: layername,
            legend: [{
                legendname: name,
                img: image,
                typ: "svg"
            }]
        };
    },

    /**
     * Creates the legend for a line style
     * @deprecated with new vectorStyle module
     * @param   {string} layername     layername defined in config
     * @param   {VectorStyle} style    style created by vectorStyle
     * @returns {object}               legend definition for a line
     */
    getLegendParamsForLinesOld: function (layername, style) {
        let name;

        const svg = this.createLineSVGOld(style);

        if (style.has("legendValue")) {
            name = style.get("legendValue");
        }
        else {
            name = layername;
        }

        return {
            name: name,
            svg: svg
        };
    },

    /**
     * Creates the legend for a polygon style
     * @deprecated with new vectorStyle module
     * @param   {string} layername     layername defined in config
     * @param   {VectorStyle} style    style created by vectorStyle
     * @returns {object}               legend definition for a polygon
     */
    getLegendParamsForPolygonsOld: function (layername, style) {
        let name;

        const svg = this.createPolygonSVGOld(style);

        if (style.has("legendValue")) {
            name = style.get("legendValue");
        }
        else {
            name = layername;
        }

        return {
            name: name,
            svg: svg
        };
    },

    /**
     * Creates the legend for a point style.
     * The Styles Circle and Advanced are processed separately.
     * @deprecated with new vectorStyle module
     * @param   {string} styleSubClass name of subclass defined in style
     * @param   {string} layername     layername defined in config
     * @param   {VectorStyle} style    style created by vectorStyle
     * @returns {object}               legend definition for a point
     */
    getLegendParamsForPointOld: function (styleSubClass, layername, style) {
        let name = [],
            svg = [],
            allItems;

        if (styleSubClass === "CIRCLE") {
            svg = this.createCircleSVGOld(style);
        }
        else if (styleSubClass === "ADVANCED") {
            allItems = this.drawAdvancedStyleOld(style, layername, svg, name);

            return {
                name: allItems[1],
                svg: allItems[0]
            };
        }
        else {
            svg = this.createImageSVG(style);
        }

        name = this.determineValueNameOld(style, layername);

        return {
            name: name,
            svg: svg
        };
    },

    /**
     * Determines the name of a feature to display in the legend.
     * The attributes are considered in the order legendValue, styleFieldValue and layerName.
     * @deprecated with new vectorStyle module
     * @param {VectorStyle} style - Style created by vectorStyle.
     * @param {string} layername - Layername defined in config.
     * @returns {string} the name for the layer in legend
     */
    determineValueNameOld: function (style, layername) {
        let name = layername;

        if (style.has("legendValue")) {
            name = style.get("legendValue");
        }
        else if (style.has("styleFieldValue") && style.get("styleFieldValue").length > 0) {
            name = style.get("styleFieldValue");
        }

        return name;
    },

    /**
     * Creates an SVG with embedded image
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createImageSVG: function (style) {
        const imagePath = style.get("imagePath") + style.get("imageName");

        let svg = "";

        svg += "<svg height='35' width='35'>";
        svg += "<image xlink:href='" + imagePath + "' x='0' y='0' height='100%' width='100%' />";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a circle
     * @deprecated with new vectorStyle module
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createCircleSVGOld: function (style) {
        let svg = "";
        const circleStrokeColor = style.returnColor(style.get("circleStrokeColor"), "hex"),
            circleStrokeOpacity = style.get("circleStrokeColor")[3] || 0,
            circleStrokeWidth = style.get("circleStrokeWidth"),
            circleFillColor = style.returnColor(style.get("circleFillColor"), "hex"),
            circleFillOpacity = style.get("circleFillColor")[3] || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<circle cx='17.5' cy='17.5' r='15' stroke='";
        svg += circleStrokeColor;
        svg += "' stroke-opacity='";
        svg += circleStrokeOpacity;
        svg += "' stroke-width='";
        svg += circleStrokeWidth;
        svg += "' fill='";
        svg += circleFillColor;
        svg += "' fill-opacity='";
        svg += circleFillOpacity;
        svg += "'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a line
     * @deprecated with new vectorStyle module
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createLineSVGOld: function (style) {
        let svg = "";
        const strokeColor = style.returnColor(style.get("lineStrokeColor"), "hex"),
            strokeWidth = parseInt(style.get("lineStrokeWidth"), 10),
            strokeOpacity = style.get("lineStrokeColor")[3] || 0,
            strokeDash = style.get("lineStrokeDash") ? style.get("lineStrokeDash").join(" ") : undefined;

        svg += "<svg height='35' width='35'>";
        svg += "<path d='M 05 30 L 30 05' stroke='";
        svg += strokeColor;
        svg += "' stroke-opacity='";
        svg += strokeOpacity;
        svg += "' stroke-width='";
        svg += strokeWidth;
        if (strokeDash) {
            svg += "' stroke-dasharray='";
            svg += strokeDash;
        }
        svg += "' fill='none'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a polygon
     * @deprecated with new vectorStyle module
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createPolygonSVGOld: function (style) {
        let svg = "";
        const fillColor = style.returnColor(style.get("polygonFillColor"), "hex"),
            strokeColor = style.returnColor(style.get("polygonStrokeColor"), "hex"),
            strokeWidth = parseInt(style.get("polygonStrokeWidth"), 10),
            fillOpacity = style.get("polygonFillColor")[3] || 0,
            strokeOpacity = style.get("polygonStrokeColor")[3] || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
        svg += fillColor;
        svg += ";fill-opacity:";
        svg += fillOpacity;
        svg += ";stroke:";
        svg += strokeColor;
        svg += ";stroke-opacity:";
        svg += strokeOpacity;
        svg += ";stroke-width:";
        svg += strokeWidth;
        svg += ";'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Draw advanced styles in legend
     * @deprecated with new vectorStyle module
     * @param {ol.style} style style from features
     * @param {String} layername Name of layer
     * @param {Array} image should contain the image source for legend elements
     * @param {Array} name should contain the names for legend elements
     * @returns {Array} returns allItems
    */
    drawAdvancedStyleOld: function (style, layername, image, name) {
        const scalingShape = style.get("scalingShape"),
            scalingAttribute = style.get("scalingAttribute"),
            scalingValueDefaultColor = style.get("scalingValueDefaultColor"),
            scaling = style.get("scaling"),
            advancedStyle = style.clone();
        let styleScalingValues = style.get("styleScalingValues"),
            allItems = [];

        // set the background of the SVG transparent
        // necessary because the image is in the background and the SVG on top of this
        if (advancedStyle.get("imageName") !== "blank.png") {
            advancedStyle.setCircleSegmentsBackgroundColor([
                255, 255, 255, 0
            ]);
        }

        // chooses which case should be draw
        if (scaling === "NOMINAL" && scalingShape === "CIRCLESEGMENTS") {
            styleScalingValues = advancedStyle.get("scalingValues");

            allItems = this.drawNominalCircleSegmentsStyle(styleScalingValues, scalingValueDefaultColor, scalingAttribute, advancedStyle, image, name);
        }
        else if (scaling === "INTERVAL" && scalingShape === "CIRCLE_BAR") {
            allItems = this.drawIntervalCircleBars(scalingAttribute, advancedStyle, layername, image, name);
        }

        return allItems;
    },

    /**
     * Draw advanced styles for nominal circle segments in legend
     * @param {Object} styleScalingValues contains values to be draw in legend
     * @param {Array} scalingValueDefaultColor color for default value
     * @param {String} scalingAttribute attribute that contains the values of a feature
     * @param {ol.style} advancedStyle copy of style
     * @param {Array} image should contain the image source for legend elements
     * @param {Array} name should contain the names for legend elements
     * @returns {Array} allItems
     */
    drawNominalCircleSegmentsStyle: function (styleScalingValues, scalingValueDefaultColor, scalingAttribute, advancedStyle, image, name) {
        let key,
            stylePerValue;

        // add defaultColor
        Object.assign(styleScalingValues, {default: scalingValueDefaultColor});

        // for all values of attribute which define in style.json
        for (key in styleScalingValues) {
            const olFeature = new Feature({});

            olFeature.set(scalingAttribute, key);
            stylePerValue = advancedStyle.createStyle(olFeature, false);

            if (Array.isArray(stylePerValue)) {
                image.push([stylePerValue[0].getImage().getSrc(), stylePerValue[1].getImage().getSrc()]);
            }
            else {
                image.push(stylePerValue.getImage().getSrc());
            }
            name.push(key);
        }

        return [image, name];
    },
    /**
     * Draw advanced styles for interval circle bars in legend
     * @param {String} scalingAttribute attribute that contains the values of a feature
     * @param {ol.style} advancedStyle copy of style
     * @param {String} layername Name des Layers
     * @param {Array} image should contain the image source for legend elements
     * @param {Array} name should contain the names for legend elements
     * @returns {Array} allItems
     */
    drawIntervalCircleBars: function (scalingAttribute, advancedStyle, layername, image, name) {
        const olFeature = new Feature({}),
            circleBarScalingFactor = advancedStyle.get("circleBarScalingFactor"),
            barHeight = String(20 / circleBarScalingFactor);
        let stylePerValue = false;

        olFeature.set(scalingAttribute, barHeight);
        if (advancedStyle.hasOwnProperty("createStyle")) {
            stylePerValue = advancedStyle.createStyle(olFeature, false);

            image.push(stylePerValue.getImage().getSrc());
            name.push(layername);
        }

        return [image, name];
    },

    /**
     * Creates legend object for vector layer using it's style
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @param   {string} layername Name of layer to use in legend view
     * @param   {integer} styleId styleId
     * @param   {string|string[]}   legendURL can be an image path as string or array of strings
     * @returns {object} legendObject legend item
     * @returns {string} legendObject.legendname layername
     * @returns {object[]} legendObject.legend Array of legend entries in this particular layer e.g. because of multiple categories
     * @returns {string} legendObject.legend.legendname name of legend entry
     * @returns {string} legendObject.legend.img svg
     * @returns {string} legendObject.legend.typ=svg fixed type
     */
    getLegendParamsFromVector: function (layername, styleId, legendURL) {
        let subLegend;
        const image = [],
            name = [],
            style = Radio.request("StyleList", "returnModelById", styleId);

        if (!style) {
            console.warn("Missing style definition for styleId " + styleId);

            return {
                layername: layername,
                legend: [{
                    legendname: [],
                    img: [],
                    typ: "svg"
                }]
            };
        }

        if (typeof legendURL === "string") {
            return {
                layername: layername,
                legend: [{
                    legendname: [],
                    img: legendURL,
                    typ: "png"
                }]
            };
        }

        style.getLegendInfos().forEach(legendInfo => {
            if (legendInfo.geometryType !== "Point" && legendInfo.geometryType !== "LineString" && legendInfo.geometryType !== "Polygon") {
                console.warn("Cannot style geometry type: " + legendInfo.geometryType);
                return;
            }

            if (legendInfo.geometryType === "Point") {
                subLegend = this.getLegendParamsForPoint(legendInfo, layername);
            }
            else if (legendInfo.geometryType === "LineString") {
                subLegend = this.getLegendParamsForLines(legendInfo, layername);
            }
            else if (legendInfo.geometryType === "Polygon") {
                subLegend = this.getLegendParamsForPolygons(legendInfo, layername);
            }
            image.push(subLegend.svg);
            name.push(subLegend.name);
        });

        return {
            layername: layername,
            legend: [{
                legendname: name,
                img: image,
                typ: "svg"
            }]
        };
    },

    /**
     * Creates the legend for a line style
     * @param   {VectorStyle} legendInfo    prepared legend infos of vectorstyle
     * @param   {string} layername     layername defined in config
     * @returns {object}               legend definition for a line
     */
    getLegendParamsForLines: function (legendInfo, layername) {
        const style = legendInfo.styleObject,
            label = legendInfo.label,
            svg = this.createLineSVG(style);

        return {
            name: label ? label : layername,
            svg: svg
        };
    },

    /**
     * Creates the legend for a polygon style
     * @param   {VectorStyle} legendInfo    prepared legend infos of vectorstyle
     * @param   {string} layername     layername defined in config
     * @returns {object}               legend definition for a polygon
     */
    getLegendParamsForPolygons: function (legendInfo, layername) {
        const style = legendInfo.styleObject,
            label = legendInfo.label,
            svg = this.createPolygonSVG(style);

        return {
            name: label ? label : layername,
            svg: svg
        };
    },

    /**
     * Creates the legend for a point style.
     * The Styles Circle and Advanced are processed separately.
     * @param   {VectorStyle} legendInfo    prepared legend infos of vectorstyle
     * @param   {string} layername     layername defined in config
     * @returns {object}               legend definition for a point
     */
    getLegendParamsForPoint: function (legendInfo, layername) {
        const style = legendInfo.styleObject,
            label = legendInfo.label,
            type = style.get("type");

        let svg = [],
            allItems;

        if (type === "circle") {
            svg = this.createCircleSVG(style);
        }
        else if (type === "nominal" || type === "interval") {
            allItems = this.drawAdvancedStyle(type, style, layername, svg);

            return {
                name: allItems[1],
                svg: allItems[0]
            };
        }
        else {
            svg = this.createImageSVG(style);
        }

        return {
            name: label ? label : layername,
            svg: svg
        };
    },

    /**
     * Draw advanced styles in legend
     * @param {ol.style} type type of point
     * @param {ol.style} style style from features
     * @param {String} layername Name of layer
     * @param {Array} image should contain the image source for legend elements
     * @returns {Array} returns allItems
    */
    drawAdvancedStyle: function (type, style, layername, image) {
        const scalingShape = style.get("scalingShape"),
            scalingAttribute = style.get("scalingAttribute"),
            scalingValueDefaultColor = style.get("scalingValueDefaultColor"),
            advancedStyle = style.clone(),
            name = [];
        let styleScalingValues = style.get("styleScalingValues"),
            allItems = [];

        // set the background of the SVG transparent
        // necessary because the image is in the background and the SVG on top of this
        if (advancedStyle.get("imageName") !== "blank.png") {
            advancedStyle.setCircleSegmentsBackgroundColor([
                255, 255, 255, 0
            ]);
        }

        // chooses which case should be draw
        if (type === "nominal" && scalingShape === "CIRCLESEGMENTS") {
            styleScalingValues = advancedStyle.get("scalingValues");

            allItems = this.drawNominalCircleSegmentsStyle(styleScalingValues, scalingValueDefaultColor, scalingAttribute, advancedStyle, image, name);
        }
        else if (type === "interval" && scalingShape === "CIRCLE_BAR") {
            allItems = this.drawIntervalCircleBars(scalingAttribute, advancedStyle, layername, image, name);
        }

        return allItems;
    },

    /**
     * Creates an SVG for a circle
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createCircleSVG: function (style) {
        let svg = "";
        const circleStrokeColor = style.get("circleStrokeColor") ? this.colorToRgb(style.get("circleStrokeColor")) : "black",
            circleStrokeOpacity = style.get("circleStrokeColor")[3] || 0,
            circleStrokeWidth = style.get("circleStrokeWidth"),
            circleFillColor = style.get("circleFillColor") ? this.colorToRgb(style.get("circleFillColor")) : "black",
            circleFillOpacity = style.get("circleFillColor")[3] || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<circle cx='17.5' cy='17.5' r='15' stroke='";
        svg += circleStrokeColor;
        svg += "' stroke-opacity='";
        svg += circleStrokeOpacity;
        svg += "' stroke-width='";
        svg += circleStrokeWidth;
        svg += "' fill='";
        svg += circleFillColor;
        svg += "' fill-opacity='";
        svg += circleFillOpacity;
        svg += "'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a line
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createLineSVG: function (style) {
        let svg = "";
        const strokeColor = style.get("lineStrokeColor") ? this.colorToRgb(style.get("lineStrokeColor")) : "black",
            strokeWidth = style.get("lineStrokeWidth"),
            strokeOpacity = style.get("lineStrokeColor")[3] || 0,
            strokeDash = style.get("lineStrokeDash") ? style.get("lineStrokeDash").join(" ") : undefined;

        svg += "<svg height='35' width='35'>";
        svg += "<path d='M 05 30 L 30 05' stroke='";
        svg += strokeColor;
        svg += "' stroke-opacity='";
        svg += strokeOpacity;
        svg += "' stroke-width='";
        svg += strokeWidth;
        if (strokeDash) {
            svg += "' stroke-dasharray='";
            svg += strokeDash;
        }
        svg += "' fill='none'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Creates an SVG for a polygon
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createPolygonSVG: function (style) {
        let svg = "";
        const fillColor = style.get("polygonFillColor") ? this.colorToRgb(style.get("polygonFillColor")) : "black",
            strokeColor = style.get("polygonStrokeColor") ? this.colorToRgb(style.get("polygonStrokeColor")) : "black",
            strokeWidth = style.get("polygonStrokeWidth"),
            fillOpacity = style.get("polygonFillColor")[3] || 0,
            strokeOpacity = style.get("polygonStrokeColor")[3] || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
        svg += fillColor;
        svg += ";fill-opacity:";
        svg += fillOpacity;
        svg += ";stroke:";
        svg += strokeColor;
        svg += ";stroke-opacity:";
        svg += strokeOpacity;
        svg += ";stroke-width:";
        svg += strokeWidth;
        svg += ";'/>";
        svg += "</svg>";

        return svg;
    },

    /**
     * Returns a rgb color string that can be interpreted in SVG.
     * @param   {integer[]} color color set in style
     * @returns {string} svg color
     */
    colorToRgb: function (color) {
        return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
    },

    /**
    * Sets the left position of the legend window in touchmove
    * @param {Number} value Left position
    * @returns {void}
    */
    setWindowLeft: function (value) {
        this.set("windowLeft", value);
    },
    /**
    * Sets the top position of the legend window in touchmove
    * @param {Number} value Top position
    * @returns {void}
    */
    setWindowTop: function (value) {
        this.set("windowTop", value);
    },
    /**
    * Sets the Start X value of the legend window in touchmove
    * @param {Number} value Start X position
    * @returns {void}
    */
    setStartX: function (value) {
        this.set("startX", value);
    },
    /**
    * Sets the Start Y value of the legend window in touchmove
    * @param {Number} value Start Y position
    * @returns {void}
    */
    setStartY: function (value) {
        this.set("startY", value);
    },
    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            currentLng: lng,
            legendTitle: i18next.t("common:modules.legend.title"),
            collapseAllText: i18next.t("common:modules.legend.collapseAll"),
            foldOutAllText: i18next.t("common:modules.legend.foldOutAll")
        });
    }
});

export default LegendModel;
