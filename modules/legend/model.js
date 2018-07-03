define(function (require) {

    var Radio = require("backbone.radio"),
        ol = require("openlayers"),
        Legend;

    Legend = Backbone.Model.extend({

        defaults: {
            getLegendURLParams: "?VERSION=1.1.1&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=",
            legendParams: [],
            wmsLayerList: [],
            wfsLayerList: [],
            geojsonLayerList: [],
            paramsStyleWMS: [],
            paramsStyleWMSArray: [],
            visible: false
        },

        initialize: function () {
            var channel = Radio.channel("Legend");

            channel.reply({
                "getLegendParams": this.getLegendParams
            }, this);

            this.listenTo(Radio.channel("ModelList"), {
                "updatedSelectedLayerList": this.setLayerList
            });
            this.listenTo(Radio.channel("StyleWMS"), {
                "updateParamsStyleWMS": this.updateParamsStyleWMSArray
            });
            this.listenTo(this, {
                "change:wmsLayerList": this.setLegendParamsFromWMS,
                "change:wfsLayerList": this.setLegendParamsFromVector,
                "change:sensorLayerList": this.setLegendParamsFromVector,
                "change:geojsonLayerList": this.setLegendParamsFromVector,
                "change:groupLayerList": this.setLegendParamsFromGROUP,
                "change:paramsStyleWMSArray": this.updateLegendFromStyleWMSArray
            });

            this.setLayerList();
        },

        setVisible: function (val) {
            this.set("visible", val);
        },

        getVisible: function () {
            return this.get("visible");
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
                    if (legendParam.layername === paramsStyleWMS.styleWMSName) {
                        var layername = legendParam.layername,
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

        getLegendParams: function () {
            return this.get("legendParams");
        },
        createLegend: function () {
            this.set("legendParams", []);
            this.set("legendParams", _.sortBy(this.get("tempArray"), function (obj) {
                return obj.layername;
            }));
        },

        setLayerList: function () {
            var filteredLayerList,
                groupedLayers,
                modelList = Radio.request("ModelList", "getCollection");

            // layerlist = modelList.where({type: "layer", isVisibleInMap: true});
            this.unsetLegendParams();
            // Die Layer die in der Legende dargestellt werden sollen
            filteredLayerList = _.filter(modelList.models, function (layer) {
                return layer.get("legendURL") !== "ignore";
            });

            // Liste wird nach Typen(WMS, WFS,...) gruppiert
            groupedLayers = _.groupBy(filteredLayerList, function (layer) {
                return layer.get("typ");
            });
            // this.set("tempArray", []);
            if (_.has(groupedLayers, "WMS")) {
                this.set("wmsLayerList", groupedLayers.WMS);
            }
            if (_.has(groupedLayers, "WFS")) {
                this.set("wfsLayerList", groupedLayers.WFS);
            }
            if (_.has(groupedLayers, "Sensor")) {
                this.set("sensorLayerList", groupedLayers.Sensor);
            }
            if (_.has(groupedLayers, "GeoJSON")) {
                this.set("geojsonLayerList", groupedLayers.GeoJSON);
            }
            if (_.has(groupedLayers, "GROUP")) {
                this.set("groupLayerList", groupedLayers.GROUP);
            }
            this.createLegend();
        },

        unsetLegendParams: function () {
            this.set("wfsLayerList", "");
            this.set("sensorLayerList", "");
            this.set("wmsLayerList", "");
            this.set("geojsonLayerList", "");
            this.set("groupLayerList", "");
            this.set("tempArray", []);
        },

        setLegendParamsFromWMS: function () {
            var paramsStyleWMSArray = this.get("paramsStyleWMSArray"),
                paramsStyleWMS = "",
                legendURL;

            _.each(this.get("wmsLayerList"), function (layer) {
                paramsStyleWMS = _.find(paramsStyleWMSArray, function (paramsStyleWMS) {
                    if (layer.get("name") === paramsStyleWMS.styleWMSName) {
                        return true;
                    }
                });
                if (paramsStyleWMS) {

                    this.push("tempArray", {
                        layername: layer.get("name"),
                        typ: "styleWMS",
                        params: paramsStyleWMS,
                        isVisibleInMap: layer.get("isVisibleInMap")
                    });
                }
                else {
                    legendURL = layer.get("legendURL");

                    this.push("tempArray", {
                        layername: layer.get("name"),
                        img: legendURL,
                        typ: "WMS",
                        isVisibleInMap: layer.get("isVisibleInMap")
                    });
                }
            }, this);
        },
        setLegendParamsFromVector: function (model, layerList) {
            _.each(layerList, function (layer) {
                var image,
                    name,
                    style,
                    styleClass,
                    styleSubClass,
                    styleFieldValues,
                    scalingShape,
                    styleScalingValues,
                    scalingAttribute;

                if (typeof layer.get("legendURL") === "string") {
                    this.push("tempArray", {
                        layername: layer.get("name"),
                        img: layer.get("legendURL"),
                        typ: layer.get("typ"),
                        isVisibleInMap: layer.get("isVisibleInMap")
                    });
                }
                else {
                    image = [];
                    name = [];
                    style = Radio.request("StyleList", "returnModelById", layer.getStyleId());
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
                            var a = this.createCircleSVG(style);
                            console.log(a);
                            image.push(this.createCircleSVG(style));
                            name.push(layer.get("name"));
                        }
                        else if (styleSubClass === "ADVANCED") {
                            scalingShape = style.get("scalingShape");
                            styleScalingValues = style.get("scalingValues");
                            scalingAttribute = style.get("scalingAttribute");
console.log(scalingShape);
console.log(styleScalingValues);
console.log(style);
// debugger;
                            if (scalingShape === "CIRCLESEGMENTS") {
                                // for all attributvalues which define in style.json
                                _.each(styleScalingValues, function (value, key) {
                                    var olFeature = new ol.Feature({
                                            geometry: new ol.geom.Point([100, 100])
                                        }),
                                        stylePerValue;
    
                                    olFeature.set(scalingAttribute, key);
                                    stylePerValue = style.createNominalCircleSegments(olFeature);
    
                                    // image.push(style.get("imagePath") + style.get("imageName"));
                                    image.push(stylePerValue);
                                    
                                    
                                    console.log(key);
                                    console.log(value);
                                    console.log(olFeature);
                                    console.log(stylePerValue);
                                }, this);
                            }


                            // style.createStyle(olFeature, false);
                            
                            // sclingValues
                            // scalingValueDefaultColor to scalingValues
                            // svg anlegen
                            // Segmente berechnen
                            // Segmente in SVG schreiben

                            // _.each(styleScalingValues, function (value, key) {
                            //     image.push(style.get("imagePath") + key);
                            // }, this);
                            
                            // image.push(style.get("imagePath") + style.get("imageName"));
                            name.push(layer.get("name"));
                        }
                        else {
                            if (style.get("imageName") !== "blank.png") {
                                image.push(style.get("imagePath") + style.get("imageName"));
                            }
                            name.push(layer.get("name"));
                        }
                    }
                    // Simple Line Style
                    if (styleClass === "LINE") {
                        image.push(this.createLineSVG(style));
                        if (style.has("legendValue")) {
                            name.push(style.get("legendValue"));
                        }
                        else {
                            name.push(layer.get("name"));
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
                                name.push(layer.get("name"));
                            }
                        }
                    }
                    this.push("tempArray", {
                        layername: layer.get("name"),
                        legendname: name,
                        img: image,
                        typ: layer.get("typ"),
                        isVisibleInMap: layer.get("isVisibleInMap")
                    });
                }
                console.log(image);
            }, this);

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
         * Übergibt GroupLayer in den tempArray. Für jeden GroupLayer wird der Typ "Group" gesetzt und als legendURL ein Array übergeben.
         * @returns {void}
         */
        setLegendParamsFromGROUP: function () {
            var groupLayerList = this.get("groupLayerList");

            _.each(groupLayerList, function (groupLayer) {
                var legendURLS = groupLayer.get("legendURL"),
                    name = groupLayer.get("name"),
                    isVisibleInMap = groupLayer.get("isVisibleInMap");

                this.push("tempArray", {
                    layername: name,
                    img: legendURLS,
                    typ: "GROUP",
                    isVisibleInMap: isVisibleInMap
                });
            }, this);
        },

        /**
         * @desc Hilfsmethode um ein Attribut vom Typ Array zu setzen.
         * @param {String} attribute - Das Attribut das gesetzt werden soll.
         * @param {whatever} value - Der Wert des Attributs.
         * @returns {void}
         */
        push: function (attribute, value) {
            var tempArray = _.clone(this.get(attribute));

            tempArray.push(value);
            this.set(attribute, _.flatten(tempArray));
        }
    });

    return new Legend();
});
