define(function (require) {
    var ol = require("openlayers"),
        BuildSpecModel;

    BuildSpecModel = Backbone.Model.extend({
        defaults: {},
        /**
         * defines the layers attribute of the map spec
         * @param {ol.layer.Layer[]} layerList - all visible layers on the map
         * @returns {void}
         */
        buildLayers: function (layerList) {
            var layers = [],
                attributes = this.get("attributes");

            layerList.forEach(function (layer) {
                if (layer instanceof ol.layer.Image) {
                    layers.push(this.buildImageWms(layer));
                }
                else if (layer instanceof ol.layer.Tile) {
                    layers.push(this.buildTileWms(layer));
                }
                else if (layer instanceof ol.layer.Vector) {
                    layers.push(this.buildVector(layer));
                }
            }, this);
            attributes.map.layers = layers.reverse();
        },

        /**
         * returns tile wms layer information
         * @param {ol.layer.Tile} layer - tile layer with tile wms source
         * @returns {object} wms layer spec
         */
        buildTileWms: function (layer) {
            var source = layer.getSource();

            return {
                baseURL: source.getUrls()[0],
                opacity: layer.getOpacity(),
                type: "WMS",
                layers: source.getParams().LAYERS.split(","),
                imageFormat: source.getParams().FORMAT,
                customParams: {
                    "TRANSPARENT": "true"
                }
            };
        },

        /**
         * returns image wms layer information
         * @param {ol.layer.Image} layer - image layer with image wms source
         * @returns {object} wms layer spec
         */
        buildImageWms: function (layer) {
            var source = layer.getSource();

            return {
                baseURL: source.getUrl(),
                opacity: layer.getOpacity(),
                type: "WMS",
                layers: source.getParams().LAYERS.split(","),
                imageFormat: source.getParams().FORMAT,
                customParams: {
                    "TRANSPARENT": "true"
                }
            };
        },

        /**
         * returns vector layer information
         * @param {ol.layer.Vector} layer - vector layer with vector source
         * @returns {object} geojson layer spec
         */
        buildVector: function (layer) {
            var source = layer.getSource(),
                geojsonList = [],
                features = source.getFeatures();

            return {
                type: "geojson",
                style: this.buildStyle(layer, features, geojsonList),
                geojson: geojsonList
            };
        },

        buildStyle: function (layer, features, geojsonList) {
            var mapfishStyleObject = {
                    "version": "2"
                },
                styleAttribute = this.getStyleAttribute(layer);

            features.forEach(function (feature) {
                var style = this.getFeatureStyle(feature, layer)[0],
                    stylingRule,
                    styleObject;

                if (style !== null) {
                    this.addFeatureToGeoJsonList(feature, geojsonList);
                    stylingRule = this.getStylingRule(feature, styleAttribute);
                    // do nothing if we already have a style object for this CQL rule
                    if (mapfishStyleObject.hasOwnProperty(stylingRule)) {
                        return;
                    }
                    styleObject = {
                        symbolizers: []
                    };
                    if (feature.getGeometry().getType() === "Point") {
                        styleObject.symbolizers.push(this.buildPointStyle(style));
                    }
                    else if (feature.getGeometry().getType() === "Polygon") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style));
                    }
                    else if (feature.getGeometry().getType() === "Circle") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style));
                    }
                    else if (feature.getGeometry().getType() === "LineString") {
                        styleObject.symbolizers.push(this.buildLineStringStyle(style));
                    }
                    mapfishStyleObject[stylingRule] = styleObject;
                }
            }, this);
            return mapfishStyleObject;
        },

        buildPointStyle: function (style) {
            if (style.getImage() instanceof ol.style.Circle) {
                return this.buildPointStyleCircle(style.getImage());
            }
            else if (style.getImage() instanceof ol.style.Icon) {
                return this.buildPointStyleIcon(style.getImage());
            }
            return this.buildPointStyleText(style.getText());
        },

        buildPointStyleCircle: function (style) {
            var fillStyle = style.getFill(),
                strokeStyle = style.getStroke(),
                obj = {
                    type: "point",
                    pointRadius: style.getRadius()
                };

            if (fillStyle !== null) {
                this.buildFillStyle(fillStyle, obj);
                obj.strokeColor = this.rgbArrayToHex(fillStyle.getColor());
            }
            if (strokeStyle !== null) {
                this.buildStrokeStyle(strokeStyle, obj);
            }
            return obj;
        },

        buildPointStyleIcon: function (style) {
            return {
                type: "point",
                graphicWidth: style.getSize()[0] * style.getScale(),
                graphicHeight: style.getSize()[1] * style.getScale(),
                externalGraphic: "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/img" + this.getImageName(style.getSrc()),
                opacity: style.getOpacity()
            };
        },

        buildPointStyleText: function (style) {
            return {
                type: "Text",
                label: style.getText(),
                fontColor: this.rgbArrayToHex(style.getFill().getColor()),
                fontSize: style.getFont().split(" ")[0]
            };
        },

        buildPolygonStyle: function (style) {
            var fillStyle = style.getFill(),
                strokeStyle = style.getStroke(),
                obj = {
                    type: "polygon"
                };

            this.buildFillStyle(fillStyle, obj);
            if (strokeStyle !== null) {
                this.buildStrokeStyle(strokeStyle, obj);
            }
            return obj;
        },

        buildLineStringStyle: function (style) {
            var strokeStyle = style.getStroke(),
                obj = {
                    type: "line"
                };

            this.buildStrokeStyle(strokeStyle, obj);
            return obj;
        },

        buildFillStyle: function (style, obj) {
            var fillColor = style.getColor();

            obj.fillColor = this.rgbArrayToHex(fillColor);
            obj.fillOpacity = fillColor[3];
            return obj;
        },

        buildStrokeStyle: function (style, obj) {
            var strokeColor = style.getColor();

            obj.strokeColor = this.rgbArrayToHex(strokeColor);
            obj.strokeOpacity = strokeColor[3];

            if (style.getWidth() !== undefined) {
                obj.strokeWidth = style.getWidth();
            }
            return obj;
        },

        getImageName: function (imageSrc) {
            var start = imageSrc.lastIndexOf("/");

            return imageSrc.substr(start);
        },

        /**
         * adds the feature to the geojson list
         * @param {ol.Feature} feature - the feature can be clustered
         * @param {GeoJSON[]} geojsonList -
         * @returns {void}
         */
        addFeatureToGeoJsonList: function (feature, geojsonList) {
            if (feature.get("features") !== undefined) {
                feature.get("features").forEach(function (clusteredFeature) {
                    geojsonList.push(this.convertFeatureToGeoJson(clusteredFeature));
                }, this);
            }
            else {
                geojsonList.push(this.convertFeatureToGeoJson(feature));
            }
        },

        /**
         * converts an openlayers feature to a GeoJSON feature object
         * @param {ol.Feature} feature - the feature to convert
         * @returns {object} GeoJSON object
         */
        convertFeatureToGeoJson: function (feature) {
            var geojsonFormat = new ol.format.GeoJSON();

            // circle is not suppported by geojson
            if (feature.getGeometry().getType() === "Circle") {
                feature.setGeometry(ol.geom.Polygon.fromCircle(feature.getGeometry()));
            }
            return geojsonFormat.writeFeatureObject(feature);
        },

        /**
         * @param {ol.Feature} feature -
         * @param {ol.layer.Vector} layer -
         * @returns {ol.style.Style[]} returns or an array of styles
         */
        getFeatureStyle: function (feature, layer) {
            var styles;

            if (feature.getStyleFunction() !== undefined) {
                styles = feature.getStyleFunction().call(feature);
            }
            else {
                styles = layer.getStyleFunction().call(layer, feature);
            }

            return !Array.isArray(styles) ? [styles] : styles;
        },

        /**
         * @param {ol.Feature} feature -
         * @param {string} styleAttribute - the attribute by whose value the feature is styled
         * @returns {string} an ECQL Expression
         */
        getStylingRule: function (feature, styleAttribute) {
            if (styleAttribute === "") {
                return "*";
            }
            else if (feature.get("features") !== undefined) {
                return "[" + styleAttribute + "='" + feature.get("features")[0].get(styleAttribute) + "']";
            }
            return "[" + styleAttribute + "='" + feature.get(styleAttribute) + "']";
        },

        /**
         * @param {ol.Layer} layer -
         * @returns {string} the attribute by whose value the feature is styled
         */
        getStyleAttribute: function (layer) {
            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.get("id")});

            if (layerModel !== undefined) {
                return Radio.request("StyleList", "returnModelById", layerModel.get("styleId")).get("styleField");
            }
            return "styleId";
        },

        /**
         * @param {number[]} rgb - a rgb color represented as an array
         * @returns {string} hex color
         */
        rgbArrayToHex: function (rgb) {
            var hexR = this.addZero(rgb[0].toString(16)),
                hexG = this.addZero(rgb[1].toString(16)),
                hexB = this.addZero(rgb[2].toString(16));

            return "#" + hexR + hexG + hexB;
        },

        /**
         * add zero to hex if required
         * @param {string} hex - hexadecimal value
         * @returns {string} hexadecimal value
         */
        addZero: function (hex) {
            return hex.length === 1 ? "0" + hex : hex;
        },
        /**
         * gets legendParams and builds legend object for mapfish print
         * @param  {Boolean} isLegendSelected flag if legend has to be printed
         * @param  {[object]}  legendParams params derived from legend module
         * @return {void}
         */
        buildLegend: function (isLegendSelected, legendParams) {
            var legendObject = {},
                filteredLegendParams = _.filter(legendParams, function (param) {
                    return param.isVisibleInMap === true;
                });

            if (isLegendSelected) {
                if (filteredLegendParams.length > 0) {
                    legendObject.layers = [];
                    _.each(filteredLegendParams, function (layerParam) {
                        legendObject.layers.push({
                            layerName: layerParam.layername,
                            values: this.prepareLegendAttributes(layerParam)
                        });
                    }, this);
                }
            }
            this.setShowLegend(isLegendSelected);
            this.setLegend(legendObject);
        },
        prepareLegendAttributes: function (layerParam) {
            var valuesArray = [];

            if (layerParam.typ === "WMS" || layerParam.typ === "WFS") {
                _.each(layerParam.img, function (url, index) {
                    var valueObj = {
                        legendType: "",
                        geometryType: "",
                        imageUrl: "",
                        color: "",
                        label: ""
                    };

                    if (layerParam.typ === "WMS") {
                        valueObj.legendType = "wmsGetLegendGraphic";
                    }
                    else if (layerParam.typ === "WFS") {
                        valueObj.legendType = "wfsImage";
                    }

                    valueObj.label = layerParam.legendname[index];
                    valueObj.imageUrl = url;
                    valuesArray.push(valueObj);
                });
            }
            else if (layerParam.typ === "styleWMS") {
                _.each(layerParam.params, function (styleWmsParam) {
                    valuesArray.push({
                        legendType: "geometry",
                        geometryType: "polygon",
                        imageUrl: "",
                        color: styleWmsParam.color,
                        label: styleWmsParam.startRange + " - " + styleWmsParam.stopRange
                    });
                });
            }

            return valuesArray;
        },
        /**
         * gets array with [GfiContent, layername, coordinates] of actual gfi
         * empty array if gfi is not active.
         * coordinates not needed, yet.
         * @param {boolean} isGfiSelected flag if gfi has to be printed
         * @param  {array} gfiArray array
         * @return {void}
         */
        buildGfi: function (isGfiSelected, gfiArray) {
            var gfiObject = {},
                gfiAttributes,
                layerName;

            if (isGfiSelected) {
                if (gfiArray.length > 0) {
                    gfiObject.layers = [];
                    gfiAttributes = gfiArray[0];
                    layerName = gfiArray[1];

                    gfiObject.layers.push({
                        layerName: layerName,
                        values: this.prepareGfiAttributes(gfiAttributes)
                    });

                }
                this.addGfiFeature(this.get("attributes").map.layers, gfiArray[2]);
            }
            this.setShowGfi(isGfiSelected);
            this.setGfi(gfiObject);
        },

        /**
         * @param {object[]} layers - layers attribute of the map spec
         * @param {number[]} coordinates - the coordinates of the gfi
         * @returns {void}
         */
        addGfiFeature: function (layers, coordinates) {
            var geojsonFormat = new ol.format.GeoJSON(),
                gfiFeature = new ol.Feature({
                    geometry: new ol.geom.Point(coordinates),
                    name: "GFI Point"
                });

            layers.splice(0, 0, {
                type: "geojson",
                geojson: [geojsonFormat.writeFeatureObject(gfiFeature)],
                style: {
                    version: "2",
                    "[name='GFI Point']": {
                        symbolizers: [{
                            fillOpacity: 0,
                            pointRadius: 18,
                            strokeColor: "#e10019",
                            strokeWidth: 3,
                            type: "point"
                        },
                        {
                            fillColor: "#e10019",
                            pointRadius: 4,
                            strokeOpacity: 0,
                            type: "point"
                        }]
                    }
                }
            });
        },
        /**
         * parses gfiAttributes object with key value pairs into array[objects] with attributes key and value
         * @param  {object} gfiAttributes gfi Mapping attributes
         * @return {[object]} parsed array[objects] with key- and value attributes
         */
        prepareGfiAttributes: function (gfiAttributes) {
            var valuesArray = [];

            _.each(gfiAttributes, function (value, key) {
                valuesArray.push({
                    key: key,
                    value: value
                });
            });

            return valuesArray;
        },
        buildScale: function (scale) {
            var scaleText = "1:" + scale;

            this.setScale(scaleText);
        },
        setMetadata: function (value) {
            this.get("attributes").metadata = value;
        },
        setShowLegend: function (value) {
            this.get("attributes").showLegend = value;
        },
        setLegend: function (value) {
            this.get("attributes").legend = value;
        },
        setShowGfi: function (value) {
            this.get("attributes").showGfi = value;
        },
        setGfi: function (value) {
            this.get("attributes").gfi = value;
        },
        setScale: function (value) {
            this.get("attributes").scale = value;
        }
    });

    return BuildSpecModel;
});
