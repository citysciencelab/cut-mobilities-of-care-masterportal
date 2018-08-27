define(function (require) {
    var ol = require("openlayers"),
        BuildSpecModel;

    BuildSpecModel = Backbone.Model.extend({
        defaults: {},
        buildLayers: function (layerList) {
            var layers = [],
                attributes = this.get("attributes");

            // console.log(layerList);
            layerList.forEach(function (layer) {
                if (layer instanceof ol.layer.Image) {
                    layers.push(this.buildImageWms(layer));
                    // console.log(this.buildImageWms(layer));
                }
                else if (layer instanceof ol.layer.Tile) {
                    layers.push(this.buildTileWms(layer));
                }
                else if (layer instanceof ol.layer.Vector) {
                    // console.log(layer.getSource().getFeatures());
                    // console.log(this.buildVector(layer));
                    layers.push(this.buildVector(layer));
                }
            }, this);
            attributes.map.layers = layers.reverse();
            // console.log(this.get("attributes"));
        },

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

        buildVector: function (layer) {
            var source = layer.getSource(),
                geojsonFeatures = [],
                features = source.getFeatures();

            return {
                type: "geojson",
                style: this.buildStyle(layer, features, geojsonFeatures),
                geojson: geojsonFeatures
            };
        },

        buildStyle: function (layer, features, geojsonFeatures) {
            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.get("id")}),
                mapfishStyleObject = {
                    "version": "2"
                },
                stylingRule,
                geojsonFormat = new ol.format.GeoJSON(),
                styleModel;

            if (layerModel !== undefined) {
                styleModel = Radio.request("StyleList", "returnModelById", layerModel.get("styleId"));
                features.forEach(function (feature) {
                    var style = this.getFeatureStyle(feature, layer)[0],
                        styleObject;

                    if (style !== null) {
                        geojsonFeatures.push(geojsonFormat.writeFeatureObject(feature));
                        stylingRule = this.getStylingRule(feature, styleModel.get("styleField"));

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
                        mapfishStyleObject[stylingRule] = styleObject;
                    }
                }, this);
            }
            // draw layer und co
            else {
            }
            return mapfishStyleObject;
        },

        buildPointStyle: function (style) {
            if (style.getImage() instanceof ol.style.Circle) {
                return this.buildPointStyleCircle(style.getImage());
            }
            return this.buildPointStyleIcon(style.getImage());
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

        buildFillStyle: function (style, obj) {
            var fillColor = style.getColor();

            obj.fillColor = this.rgbArrayToHex(fillColor);
            obj.fillOpacity = fillColor[3];
            return obj;
        },

        buildStrokeStyle: function (style, obj) {
            var strokeColor = style.getColor(),
                strokeWidth = style.getWidth();

            obj.strokeColor = this.rgbArrayToHex(strokeColor);
            obj.strokeOpacity = strokeColor[3];

            if (strokeWidth !== undefined) {
                obj.strokeWidth = strokeWidth;
            }
            return obj;
        },

        getImageName: function (imageSrc) {
            var start = imageSrc.lastIndexOf("/");

            return imageSrc.substr(start);
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
            return "[" + styleAttribute + "='" + feature.get(styleAttribute) + "']";
        },

        rgbArrayToHex: function (rgb) {
            var hexR = this.colorZeroPadding(rgb[0].toString(16)),
                hexG = this.colorZeroPadding(rgb[1].toString(16)),
                hexB = this.colorZeroPadding(rgb[2].toString(16));

            return "#" + hexR + hexG + hexB;
        },

        colorZeroPadding: function (hex) {
            return hex.length === 1 ? "0" + hex : hex;
        },
        buildLegend: function (legendParams) {
            var legendObject = {},
                showLegend = false,
                filteredLegendParams = _.filter(legendParams, function (param) {
                    return param.isVisibleInMap === true;
                });

            console.log(filteredLegendParams);
            if (filteredLegendParams.length > 0) {
                legendObject.layers = [];
                _.each(filteredLegendParams, function (layerParam) {
                    legendObject.layers.push({
                        layerName: layerParam.layername,
                        values: this.prepareLegendAttributes(layerParam)
                    });
                }, this);
                showLegend = true;
            }
            this.setShowLegend(showLegend);
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
         * @param  {array} gfiArray array
         * @return {void}
         */
        buildGfi: function (gfiArray) {
            var gfiObject = {},
                showGfi = false,
                gfiAttributes,
                layerName;

            if (gfiArray.length > 0) {
                gfiObject.layers = [];
                showGfi = true;
                gfiAttributes = gfiArray[0];
                layerName = gfiArray[1];

                gfiObject.layers.push({
                    layerName: layerName,
                    values: this.prepareGfiAttributes(gfiAttributes)
                });

            }
            this.setShowGfi(showGfi);
            this.setGfi(gfiObject);
        },
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
        }
    });

    return BuildSpecModel;
});
