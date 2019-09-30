import Feature from "ol/Feature.js";
import Tool from "../core/modelList/tool/model";

const LegendModel = Tool.extend(/** @lends LegendModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        legendParams: [],
        paramsStyleWMS: [],
        paramsStyleWMSArray: [],
        renderToWindow: false,
        renderToSidebar: false,
        keepOtherToolsOpened: true,
        glyphicon: "glyphicon-book"
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
     * @listens ModelList#RadioTriggerModelListUpdatedSelectedLayerList
     * @listens StyleWMS#RadioTriggerStyleWmsUpdateParamsStyleWMS
     * @listens StyleWMS#RadioTriggerStyleWmsResetParamsStyleWMS
     * @fires ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires StyleList#RadioRequestReturnModelById
     * @fires Legend#changeLegendParams
     * @fires Legend#changeParamsStyleWMSArray
     */
    initialize: function () {
        var channel = Radio.channel("Legend");

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
        this.listenTo(Radio.channel("ModelList"), {
            "updatedSelectedLayerList": this.setLayerList
        });
        this.listenTo(Radio.channel("StyleWMS"), {
            "updateParamsStyleWMS": this.updateParamsStyleWMSArray,
            "resetParamsStyleWMS": this.resetParamsStyleWMSArray
        });
        this.listenTo(this, {
            "change:paramsStyleWMSArray": this.updateLegendFromStyleWMSArray
        });
    },

    /**
     * Creates the legend information for one layer and returns it
     * @param  {Object} layer requested layer
     * @return {Object} returns legend information
     */
    getLegend: function (layer) {
        var layerSources = layer.get("layerSource"); // Array oder undefined

        return this.getLegendDefinition(layer.get("name"), layer.get("typ"), layer.get("legendURL"), layer.get("styleId"), layerSources);
    },
    /**
    * todo
    * @param {*} params todo
    * @returns {void}
    */
    updateParamsStyleWMSArray: function (params) {

        var paramsStyleWMSArray2 = this.copyOtherParamsStyleWMS(params.styleWMSName);

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
        var paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
            paramsStyleWMSArray2 = [];

        _.each(paramsStyleWMSArray, function (paramsStyleWMS) {
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

        var legendParams;

        // Remove custom style from paramsStyleWMSArray
        this.set("paramsStyleWMSArray", this.copyOtherParamsStyleWMS(layer.get("name")));

        // Update legendParams: Replace legend for custom style with legend from legendURL
        legendParams = this.get("legendParams");

        _.each(this.get("legendParams"), function (legendParam, i) {

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
        var paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
            legendParams = this.get("legendParams");

        _.each(this.get("legendParams"), function (legendParam, i) {
            _.find(paramsStyleWMSArray, function (paramsStyleWMS) {
                var layername,
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
    * @fires ModelList#RadioRequestModelListGetModelsByAttributes
    * @returns {void}
    */
    setLayerList: function () {
        var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}),
            sortedModelList = _.sortBy(modelList, layer => layer.get("name")),
            visibleLayer = sortedModelList.filter(layer => layer.get("legendURL") !== "ignore"),
            tempArray = [];

        _.each(visibleLayer, function (layer) {
            var layerSources = layer.get("layerSource"); // Array oder undefined

            tempArray.push(this.getLegendDefinition(layer.get("name"), layer.get("typ"), layer.get("legendURL"), layer.get("styleId"), layerSources));
        }, this);

        this.unset("legendParams");
        this.set("legendParams", tempArray);
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
        var defs = [];

        if (legendURL === "ignore") {
            return {
                layername: layername,
                legend: null
            };
        }
        else if (typ === "WMS") {
            return this.getLegendParamsFromWMS(layername, legendURL);
        }
        else if (typ === "WFS") {
            return this.getLegendParamsFromVector(layername, styleId);
        }
        else if (typ === "SensorThings") {
            return this.getLegendParamsFromVector(layername, styleId);
        }
        else if (typ === "GeoJSON") {
            return this.getLegendParamsFromVector(layername, styleId);
        }
        else if (typ === "StaticImage") {
            return this.getLegendParamsFromURL(layername, legendURL, typ);
        }
        else if (typ === "GROUP") {
            _.each(layerSources, function (layerSource) {
                var childLegend = this.getLegendDefinition(layerSource.get("name"), layerSource.get("typ"), layerSource.get("legendURL"), layerSource.get("styleId"), null);

                if (childLegend.legend) {
                    // layerSource-Abfragen haben immer nur legend[0]
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
        var paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
            paramsStyleWMS = "";

        paramsStyleWMS = _.find(paramsStyleWMSArray, function (params) {
            var bol;

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
     * @fires StyleList#RadioRequestReturnModelById
     * @param   {string} layername Name of layer to use in legend view
     * @param   {integer} styleId styleId
     * @returns {object} legendObject legend item
     * @returns {string} legendObject.legendname layername
     * @returns {object[]} legendObject.legend Array of legend entries in this particular layer e.g. because of multiple categories
     * @returns {string} legendObject.legend.legendname name of legend entry
     * @returns {string} legendObject.legend.img svg
     * @returns {string} legendObject.legend.typ=svg fixed type
     */
    getLegendParamsFromVector: function (layername, styleId) {
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

        const style = Radio.request("StyleList", "returnModelById", styleId).clone(),
            styleClass = style.get("class"),
            styleSubClass = style.get("subClass"),
            styleFieldValues = style.get("styleFieldValues"),
            image = [],
            name = [];

        if (styleClass === "POINT") {
            // Custom Point Styles
            if (styleSubClass === "CUSTOM") {
                _.each(styleFieldValues, function (styleFieldValue) {
                    const subStyle = style.clone();

                    // overwrite style with all styleFieldValue settings
                    for (const key in styleFieldValue) {
                        subStyle.set(key, styleFieldValue[key]);
                    }
                    subLegend = this.getLegendParamsForPoint("", layername, subStyle);
                    image.push(subLegend.svg);
                    name.push(subLegend.name);
                }, this);
            }
            else {
                subLegend = this.getLegendParamsForPoint(styleSubClass, layername, style);
                image.push(subLegend.svg);
                name.push(subLegend.name);
            }
        }
        else if (styleClass === "LINE") {
            // Custom Point Styles
            if (styleSubClass === "CUSTOM") {
                _.each(styleFieldValues, function (styleFieldValue) {
                    const subStyle = style.clone();

                    // overwrite style with all styleFieldValue settings
                    for (const key in styleFieldValue) {
                        subStyle.set(key, styleFieldValue[key]);
                    }
                    subLegend = this.getLegendParamsForLines(layername, subStyle);
                    image.push(subLegend.svg);
                    name.push(subLegend.name);
                }, this);
            }
            else {
                subLegend = this.getLegendParamsForLines(layername, style);
                image.push(subLegend.svg);
                name.push(subLegend.name);
            }
        }
        else if (styleClass === "POLYGON") {
            // Custom Point Styles
            if (styleSubClass === "CUSTOM") {
                _.each(styleFieldValues, function (styleFieldValue) {
                    const subStyle = style.clone();

                    // overwrite style with all styleFieldValue settings
                    for (const key in styleFieldValue) {
                        subStyle.set(key, styleFieldValue[key]);
                    }
                    subLegend = this.getLegendParamsForPolygons(layername, subStyle);
                    image.push(subLegend.svg);
                    name.push(subLegend.name);
                }, this);
            }
            else {
                subLegend = this.getLegendParamsForPolygons(layername, style);
                image.push(subLegend.svg);
                name.push(subLegend.name);
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
     * @param   {string} layername     layername defined in config
     * @param   {VectorStyle} style    style created by vectorStyle
     * @returns {object}               legend definition for a line
     */
    getLegendParamsForLines: function (layername, style) {
        let name;

        const svg = this.createLineSVG(style);

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
     * @param   {string} layername     layername defined in config
     * @param   {VectorStyle} style    style created by vectorStyle
     * @returns {object}               legend definition for a polygon
     */
    getLegendParamsForPolygons: function (layername, style) {
        let name;

        const svg = this.createPolygonSVG(style);

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
     * Creates the legend for a point style
     * @param   {string} styleSubClass name of subclass defined in style
     * @param   {string} layername     layername defined in config
     * @param   {VectorStyle} style    style created by vectorStyle
     * @returns {object}               legend definition for a point
     */
    getLegendParamsForPoint: function (styleSubClass, layername, style) {
        let name, svg, allItems;

        // Circle Point Style
        if (styleSubClass === "CIRCLE") {
            svg = this.createCircleSVG(style);
        }
        // Advanced Point Styles
        else if (styleSubClass === "ADVANCED") {
            allItems = this.drawAdvancedStyle(style, layername, svg, name);

            return {
                name: allItems[1],
                svg: allItems[0]
            };
        }
        else {
            svg = this.createImageSVG(style);
        }

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
     * Creates an SVG with embedded image
     * @param   {vectorStyle} style feature styles
     * @returns {string} svg
     */
    createImageSVG: function (style) {
        const imagePath = style.get("imagePath") + style.get("imageName"),
            scale = style.get("imageScale"),
            imageScale = Math.round(35 * scale);
        let svg = "";

        svg += "<svg height='35' width='35'>";
        svg += "<image xlink:href='" + imagePath + "' x='0' y='0' height='" + imageScale + "px' width='" + imageScale + "px'/>";
        svg += "</svg>";

        return svg;
    },
    /**
    * todo
    * @param {*} style todo
    * @returns {*} returns todo
    */
    createCircleSVG: function (style) {
        var svg = "",
            circleStrokeColor = style.returnColor(style.get("circleStrokeColor"), "hex"),
            circleStrokeOpacity = style.get("circleStrokeColor")[3].toString() || 0,
            circleStrokeWidth = style.get("circleStrokeWidth"),
            circleFillColor = style.returnColor(style.get("circleFillColor"), "hex"),
            circleFillOpacity = style.get("circleFillColor")[3].toString() || 0;

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
        var svg = "",
            strokeColor = style.returnColor(style.get("lineStrokeColor"), "hex"),
            strokeWidth = parseInt(style.get("lineStrokeWidth"), 10),
            strokeOpacity = style.get("lineStrokeColor")[3].toString() || 0;

        svg += "<svg height='35' width='35'>";
        svg += "<path d='M 05 30 L 30 05' stroke='";
        svg += strokeColor;
        svg += "' stroke-opacity='";
        svg += strokeOpacity;
        svg += "' stroke-width='";
        svg += strokeWidth;
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
        var svg = "",
            fillColor = style.returnColor(style.get("polygonFillColor"), "hex"),
            strokeColor = style.returnColor(style.get("polygonStrokeColor"), "hex"),
            strokeWidth = parseInt(style.get("polygonStrokeWidth"), 10),
            fillOpacity = style.get("polygonFillColor")[3].toString() || 0,
            strokeOpacity = style.get("polygonStrokeColor")[3].toString() || 0;

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
     * @param {ol.style} style style from features
     * @param {String} layername Name of layer
     * @param {Array} image should contain the image source for legend elements
     * @param {Array} name should contain the names for legend elements
     * @returns {Array} returns allItems
    */
    drawAdvancedStyle: function (style, layername, image, name) {
        var scalingShape = style.get("scalingShape"),
            scalingAttribute = style.get("scalingAttribute"),
            scalingValueDefaultColor = style.get("scalingValueDefaultColor"),
            styleScalingValues = style.get("styleScalingValues"),
            scaling = style.get("scaling"),
            advancedStyle = style.clone(),
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
        // add defaultColor
        _.extend(styleScalingValues, {default: scalingValueDefaultColor});

        // for all values of attribute which define in style.json
        _.each(styleScalingValues, function (value, key) {
            var olFeature = new Feature({}),
                stylePerValue;

            olFeature.set(scalingAttribute, key);
            stylePerValue = advancedStyle.createStyle(olFeature, false);

            if (_.isArray(stylePerValue)) {
                image.push([stylePerValue[0].getImage().getSrc(), stylePerValue[1].getImage().getSrc()]);
            }
            else {
                image.push(stylePerValue.getImage().getSrc());
            }
            name.push(key);
        }, this);

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
        var olFeature = new Feature({}),
            stylePerValue,
            circleBarScalingFactor = advancedStyle.get("circleBarScalingFactor"),
            barHeight = String(20 / circleBarScalingFactor);

        olFeature.set(scalingAttribute, barHeight);
        stylePerValue = advancedStyle.createStyle(olFeature, false);

        image.push(stylePerValue.getImage().getSrc());
        name.push(layername);

        return [image, name];
    }
});

export default LegendModel;
