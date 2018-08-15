define(function (require) {

    var Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Legend;

    Legend = Backbone.Model.extend({

        defaults: {
            getLegendURLParams: "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=",
            legendParams: [],
            paramsStyleWMS: [],
            paramsStyleWMSArray: [],
            visible: false
        },

        initialize: function () {
            var channel = Radio.channel("Legend");

            channel.reply({
                "getLegendParams": function () {
                    return this.get("legendParams");
                }
            }, this);

            this.listenTo(Radio.channel("ModelList"), {
                "updatedSelectedLayerList": this.setLayerList
            });
            this.listenTo(Radio.channel("StyleWMS"), {
                "updateParamsStyleWMS": this.updateParamsStyleWMSArray
            });
            this.listenTo(this, {
                "change:paramsStyleWMSArray": this.updateLegendFromStyleWMSArray
            });

            this.setLayerList();
        },

        setVisible: function (val) {
            this.set("visible", val);
        },

        updateParamsStyleWMSArray: function (params) {
            var paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
                paramsStyleWMSArray2 = [];

            _.each(paramsStyleWMSArray, function (paramsStyleWMS) {
                if (params.styleWMSName !== paramsStyleWMS.styleWMSName) {
                    paramsStyleWMSArray2.push(paramsStyleWMS);
                }
            });
            paramsStyleWMSArray2.push(params);
            this.set("paramsStyleWMS", params);
            this.set("paramsStyleWMSArray", paramsStyleWMSArray2);
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
        },

        setLayerList: function () {
            var modelList = Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true}),
                sortedModelList = _.sortBy(modelList, function (layer) {
                    return layer.get("name");
                }),
                visibleLayer = _.filter(sortedModelList, function (layer) {
                    return layer.get("legendURL") !== "ignore";
                }),
                ungroupedLayer = this.replaceChildLayerInLayerlist(visibleLayer),
                tempArray = [];

            this.unsetLegendParams();

            _.each(ungroupedLayer, function (layer) {
                var typ = layer.get("typ"),
                    layername = layer.get("name"),
                    legendURL = layer.get("legendURL"),
                    isVisibleInMap = layer.get("isVisibleInMap"),
                    typ = layer.get("typ"),
                    styleId = layer.get("styleId");

                if (typ === "WMS") {
                    tempArray.push(this.setLegendParamsFromWMS(layername, legendURL));
                }
                else if (typ === "WFS") {
                    tempArray.push(this.setLegendParamsFromVector(layername, legendURL, typ, styleId));
                }
                else if (typ === "SensorThings" || typ === "ESRIStreamLayer") {
                    tempArray.push(this.setLegendParamsFromVector(layername, legendURL, typ, styleId));
                }
                else if (typ === "GeoJSON") {
                    tempArray.push(this.setLegendParamsFromVector(layername, legendURL, typ, styleId));
                }
            }, this);

            this.set("legendParams", tempArray );
        },

        /**
         * Ersetzt in der layerlist alle Gruppenlayer durch ihre childLayer
         * @param  {layer[]} layerlist layerList mit Group-Layern
         * @return {layer[]}           layerlist mit childLayern
         */
        replaceChildLayerInLayerlist: function (layerlist) {
            var groupLayer = [];

            _.each(layerlist, function (layer) {
                if (layer.get("typ") === "GROUP") {
                    _.each(layer.get("childLayer"), function (childLayer) {
                        groupLayer.push(childLayer);
                    });
                }
            }, this);
            layerlist = _.union(layerlist, groupLayer);
            return _.reject (layerlist, function (layer) {
                return layer.get("typ") === "GROUP";
            });
        },

        unsetLegendParams: function () {
            this.set("tempArray", []);
        },

        setLegendParamsFromWMS: function (layername, legendURL) {
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
                    typ: "styleWMS",
                    params: paramsStyleWMS
                };
            }
            else {
                return {
                    layername: layername,
                    img: legendURL,
                    typ: "WMS"
                };
            }
        },

        setLegendParamsFromVector: function (layername, legendURL, typ, styleId) {
            var image,
                name,
                style,
                styleClass,
                styleSubClass,
                styleFieldValues,
                allItems;

            if (typeof legendURL === "string") {
                return {
                    layername: layername,
                    img: legendURL,
                    typ: typ
                };
            }
            else {
                image = [];
                name = [];
                style = Radio.request("StyleList", "returnModelById", styleId);
                styleClass = style.get("class");
                styleSubClass = style.get("subClass");
                styleFieldValues = style.get("styleFieldValues");

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
                    legendname: name,
                    img: image,
                    typ: typ
                };
            }
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
                var olFeature = new ol.Feature({}),
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
            var olFeature = new ol.Feature({}),
                stylePerValue;

            olFeature.set(scalingAttribute, "20");
            stylePerValue = advancedStyle.createStyle(olFeature, false);

            image.push(stylePerValue.getImage().getSrc());
            name.push(layername);

            return [image, name];
        }
    });

    return new Legend();
});
