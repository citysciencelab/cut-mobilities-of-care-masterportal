import Feature from "ol/Feature.js";
import Tool from "../core/modelList/tool/model";

const Legend = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        legendParams: [],
        paramsStyleWMS: [],
        paramsStyleWMSArray: [],
        renderToWindow: false,
        renderToSidebar: false,
        glyphicon: "glyphicon-book"
    }),
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
     * Erstellt die Legendeninformation zu einem Layer und liefert diese zurück
     * @param  {object} layer gesuchter Layer
     * @return {object}       Legendeninformation
     */
    getLegend: function (layer) {
        var layerSources = layer.get("layerSource"); // Array oder undefined

        if (layer.get("isVisibleInMap")) {
            return this.getLegendDefinition(layer.get("name"), layer.get("typ"), layer.get("legendURL"), layer.get("styleId"), layerSources);
        }
        return {
            layername: layer.get("name"),
            legend: null
        };
    },

    updateParamsStyleWMSArray: function (params) {

        var paramsStyleWMSArray2 = this.copyOtherParamsStyleWMS(params.styleWMSName);

        paramsStyleWMSArray2.push(params);
        this.set("paramsStyleWMS", params);
        this.set("paramsStyleWMSArray", paramsStyleWMSArray2);
    },

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
     * Setzt die Legendeninformationen aller sichtbaren Layer
     * @fires this#change:legendParams
     * @returns {void}
     */
    setLayerList: function () {
        var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}),
            sortedModelList = _.sortBy(modelList, function (layer) {
                return layer.get("name");
            }),
            visibleLayer = _.filter(sortedModelList, function (layer) {
                return layer.get("legendURL") !== "ignore";
            }),
            tempArray = [];

        _.each(visibleLayer, function (layer) {
            var layerSources = layer.get("layerSource"); // Array oder undefined

            tempArray.push(this.getLegendDefinition(layer.get("name"), layer.get("typ"), layer.get("legendURL"), layer.get("styleId"), layerSources));
        }, this);

        this.unset("legendParams");
        this.set("legendParams", tempArray);
    },

    /**
     * Wertet den Layer aus und gibt dessen Legendendefinition zurück
     * @param  {string} layername         Name des Layers
     * @param  {string} typ               Typ des Layers
     * @param  {string[]} [legendURL]     Nur bei typ !== GROUP
     * @param  {string} [styleId]         Nur bei typ === WFS
     * @param  {object[]} [layerSources]  Nur bei typ === GROUP
     * @return {object}                   Legendendefinition
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
            return this.getLegendParamsFromVector(layername, legendURL, typ, styleId);
        }
        else if (typ === "SensorThings") {
            return this.getLegendParamsFromVector(layername, legendURL, typ, styleId);
        }
        else if (typ === "GeoJSON") {
            return this.getLegendParamsFromVector(layername, legendURL, typ, styleId);
        }
        else if (typ === "GROUP") {
            _.each(layerSources, function (layerSource) {
                var childLegend = this.getLegendDefinition(layerSource.get("name"), layerSource.get("typ"), layerSource.get("legendURL"), layerSource.get("styleId"), null);

                if (childLegend.legend) {
                    // layerSource-Abfragen haben immer nur legend[0]
                    defs.push(childLegend.legend[0]);
                }
            }, this);

            if (defs.length > 0) {
                return {
                    layername: layername,
                    legend: defs
                };
            }
        }
        return {
            layername: layername,
            legend: null
        };
    },

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
        return {
            layername: layername,
            legend: [{
                img: legendURL,
                typ: "WMS"
            }]
        };
    },

    getLegendParamsFromVector: function (layername, legendURL, typ, styleId) {
        var image,
            name,
            style,
            styleClass,
            styleSubClass,
            styleFieldValues,
            allItems;

        if (typeof legendURL === "string" && legendURL !== "") {
            return {
                layername: layername,
                legend: [{
                    img: legendURL,
                    typ: typ
                }]
            };
        }

        image = [];
        name = [];
        style = Radio.request("StyleList", "returnModelById", styleId);

        if (!_.isUndefined(style)) {
            styleClass = style.get("class");
            styleSubClass = style.get("subClass");
            styleFieldValues = style.get("styleFieldValues");
        }

        if (styleClass === "POINT") {
            // Custom Point Styles
            if (styleSubClass === "CUSTOM") {
                _.each(styleFieldValues, function (styleFieldValue) {
                    image.push(style.get("imagePath") + styleFieldValue.imageName);
                    if (_.has(styleFieldValue, "legendValue")) {
                        name.push(styleFieldValue.legendValue);
                    }
                    else {
                        name.push(styleFieldValue.styleFieldValue);
                    }
                });
            }
            // Circle Point Style
            else if (styleSubClass === "CIRCLE") {
                image.push(this.createCircleSVG(style));
                name.push(layername);
            }
            // Advanced Point Styles
            else if (styleSubClass === "ADVANCED") {
                allItems = this.drawAdvancedStyle(style, layername, image, name);

                image = allItems[0];
                name = allItems[1];
            }
            else {
                if (style.get("imageName") !== "blank.png") {
                    image.push(style.get("imagePath") + style.get("imageName"));
                }
                name.push(layername);
            }
        }
        // Simple Line Style
        if (styleClass === "LINE") {
            image.push(this.createLineSVG(style));
            if (style.has("legendValue")) {
                name.push(style.get("legendValue"));
            }
            else {
                name.push(layername);
            }
        }
        // Simple Polygon Style
        if (styleClass === "POLYGON") {
            if (styleSubClass === "CUSTOM") {
                _.each(styleFieldValues, function (styleFieldValue) {
                    image.push(this.createPolygonSVG(style, styleFieldValue));
                    if (_.has(styleFieldValue, "legendValue")) {
                        name.push(styleFieldValue.legendValue);
                    }
                    else {
                        name.push(styleFieldValue.styleFieldValue);
                    }
                }, this);
            }
            else {
                image.push(this.createPolygonSVG(style));
                if (style.has("legendValue")) {
                    name.push(style.get("legendValue"));
                }
                else {
                    name.push(layername);
                }
            }
        }
        return {
            layername: layername,
            legend: [{
                legendname: name,
                img: image,
                typ: typ
            }]
        };
    },
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
    createPolygonSVG: function (style, styleFieldValue) {
        var svg = "",
            fillColor = !_.isUndefined(styleFieldValue) && styleFieldValue.polygonFillColor ? style.returnColor(styleFieldValue.polygonFillColor, "hex") : style.returnColor(style.get("polygonFillColor"), "hex"),
            strokeColor = !_.isUndefined(styleFieldValue) && styleFieldValue.polygonStrokeColor ? style.returnColor(styleFieldValue.polygonStrokeColor, "hex") : style.returnColor(style.get("polygonStrokeColor"), "hex"),
            strokeWidth = !_.isUndefined(styleFieldValue) && styleFieldValue.polygonStrokeWidth ? parseInt(styleFieldValue.polygonStrokeWidth, 10) : parseInt(style.get("polygonStrokeWidth"), 10),
            fillOpacity = !_.isUndefined(styleFieldValue) && styleFieldValue.polygonFillColor ? styleFieldValue.polygonFillColor[3].toString() : style.get("polygonFillColor")[3].toString() || 0,
            strokeOpacity = !_.isUndefined(styleFieldValue) && styleFieldValue.polygonStrokeColor ? styleFieldValue.polygonStrokeColor[3].toString() : style.get("polygonStrokeColor")[3].toString() || 0;

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
     * draw advanced styles in legend
     * @param {ol.style} style - style from features
     * @param {string} layername - Name des Layers
     * @param {array} image - should contains the image source for legend elements
     * @param {array} name - should contains the names for legend elements
     * @returns {array} allItems
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
     * draw advanced styles for nominal circle segments in legend
     * @param {object} styleScalingValues - contains values to be draw in legend
     * @param {array} scalingValueDefaultColor - color for default value
     * @param {String} scalingAttribute - attribute that contains the values of a feature
     * @param {ol.style} advancedStyle - copy of style
     * @param {array} image - should contains the image source for legend elements
     * @param {array} name - should contains the names for legend elements
     * @returns {array} allItems
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
     * draw advanced styles for interval circle bars in legend
     * @param {String} scalingAttribute - attribute that contains the values of a feature
     * @param {ol.style} advancedStyle - copy of style
     * @param {string} layername - Name des Layers
     * @param {array} image - should contains the image source for legend elements
     * @param {array} name - should contains the names for legend elements
     * @returns {array} allItems
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

export default Legend;
