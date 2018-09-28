define(function (require) {
    var ol = require("openlayers"),
        BuildSpecModel;

    BuildSpecModel = Backbone.Model.extend({
        defaults: {
            uniqueIdList: []
        },
        initialize: function () {
            this.listenTo(Radio.channel("CswParser"), {
                "fetchedMetaData": this.fetchedMetaData
            });
        },
        fetchedMetaData: function (cswObj) {
            if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj.uniqueId)) {
                this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj.uniqueId);
                this.updateMetaData(cswObj.layerName, cswObj.parsedData);
            }
        },
        isOwnMetaRequest: function (uniqueIdList, uniqueId) {
            return _.contains(uniqueIdList, uniqueId);
        },
        removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
            this.setUniqueIdList(_.without(uniqueIdList, uniqueId));
        },
        updateMetaData: function (layerName, parsedData) {
            var layers = _.has(this.get("attributes"), "legend") && _.has(this.get("attributes").legend, "layers") ? this.get("attributes").legend.layers : undefined,
                layer = _.findWhere(layers, {layerName: layerName});

            if (!_.isUndefined(layer)) {
                layer.metaDate = _.has(parsedData, "date") ? parsedData.date : "";
                layer.metaOwner = _.has(parsedData, "orga") ? parsedData.orga : "";
                layer.metaAddress = _.has(parsedData, "address") ? this.parseAddress(parsedData.address) : "";
                layer.metaEmail = _.has(parsedData, "email") ? parsedData.email : "";
                layer.metaTel = _.has(parsedData, "tel") ? parsedData.tel : "";
                layer.metaUrl = _.has(parsedData, "url") ? parsedData.url : "";
            }
        },
        parseAddress: function (addressObj) {
            var street = _.isUndefined(addressObj) ? undefined : addressObj.street,
                housenr = _.isUndefined(addressObj) ? undefined : addressObj.housenr,
                postalCode = _.isUndefined(addressObj) ? undefined : addressObj.postalCode,
                city = _.isUndefined(addressObj) ? undefined : addressObj.city,
                addressString = "";

            addressString = addressString + _.isUndefined(street) ? "" : street;
            addressString = addressString === "" ? "" : " ";
            addressString = addressString + _.isUndefined(housenr) ? "" : housenr;
            addressString = addressString === "" ? "" : addressString + "\n ";
            addressString = addressString + _.isUndefined(postalCode) ? "" : postalCode;
            addressString = addressString === "" ? "" : " ";
            addressString = addressString + _.isUndefined(city) ? "" : city;

            return addressString;
        },
        /**
         * defines the layers attribute of the map spec
         * @param {ol.layer.Layer[]} layerList - all visible layers on the map
         * @returns {void}
         */
        buildLayers: function (layerList) {
            var layers = [],
                attributes = this.get("attributes"),
                extent = Radio.request("MapView", "getCurrentExtent"),
                features = [];

            layerList.forEach(function (layer) {
                if (layer instanceof ol.layer.Image) {
                    layers.push(this.buildImageWms(layer));
                }
                else if (layer instanceof ol.layer.Tile) {
                    layers.push(this.buildTileWms(layer));
                }
                else if (layer instanceof ol.layer.Vector) {
                    features = layer.getSource().getFeaturesInExtent(extent);
                    if (features.length > 0) {
                        layers.push(this.buildVector(layer, features));
                    }
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
            var source = layer.getSource(),
                mapObject = {
                    baseURL: source.getUrls()[0],
                    opacity: layer.getOpacity(),
                    type: "WMS",
                    layers: source.getParams().LAYERS.split(","),
                    imageFormat: source.getParams().FORMAT,
                    customParams: {
                        "TRANSPARENT": "true"
                    }
                };

            if (_.has(source.getParams(), "SLD_BODY")) {
                mapObject.customParams.SLD_BODY = source.getParams().SLD_BODY;
                mapObject.styles = ["style"];
            }
            return mapObject;
        },

        /**
         * returns image wms layer information
         * @param {ol.layer.Image} layer - image layer with image wms source
         * @returns {object} wms layer spec
         */
        buildImageWms: function (layer) {
            var source = layer.getSource(),
                mapObject = {
                    baseURL: source.getUrl(),
                    opacity: layer.getOpacity(),
                    type: "WMS",
                    layers: source.getParams().LAYERS.split(","),
                    imageFormat: source.getParams().FORMAT,
                    customParams: {
                        "TRANSPARENT": "true"
                    }
                };

            return mapObject;
        },

        /**
         * returns vector layer information
         * @param {ol.layer.Vector} layer - vector layer with vector source
         * @param {[ol.feature]} features vectorfeatures
         * @returns {object} geojson layer spec
        */
        buildVector: function (layer, features) {
            var geojsonList = [];

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
                    stylingRule = this.getStylingRule(layer, feature, styleAttribute);
                    // do nothing if we already have a style object for this CQL rule
                    if (mapfishStyleObject.hasOwnProperty(stylingRule)) {
                        return;
                    }
                    styleObject = {
                        symbolizers: []
                    };
                    if (feature.getGeometry().getType() === "Point" || feature.getGeometry().getType() === "MultiPoint") {
                        styleObject.symbolizers.push(this.buildPointStyle(style, layer));
                    }
                    else if (feature.getGeometry().getType() === "Polygon" || feature.getGeometry().getType() === "MultiPolygon") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style, layer));
                    }
                    else if (feature.getGeometry().getType() === "Circle") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style, layer));
                    }
                    else if (feature.getGeometry().getType() === "LineString" || feature.getGeometry().getType() === "MultiLineString") {
                        styleObject.symbolizers.push(this.buildLineStringStyle(style, layer));
                    }
                    // label styling
                    if (style.getText() !== null && style.getText() !== undefined) {
                        styleObject.symbolizers.push(this.buildTextStyle(style.getText()));
                    }
                    mapfishStyleObject[stylingRule] = styleObject;
                }
            }, this);
            return mapfishStyleObject;
        },

        buildPointStyle: function (style, layer) {
            if (style.getImage() instanceof ol.style.Circle) {
                return this.buildPointStyleCircle(style.getImage());
            }
            else if (style.getImage() instanceof ol.style.Icon) {
                return this.buildPointStyleIcon(style.getImage(), layer);
            }
            return this.buildTextStyle(style.getText());
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
                this.buildStrokeStyle(fillStyle, obj);
            }
            if (strokeStyle !== null) {
                this.buildStrokeStyle(strokeStyle, obj);
            }
            return obj;
        },

        buildPointStyleIcon: function (style, layer) {
            return {
                type: "point",
                graphicWidth: style.getSize()[0] * style.getScale(),
                graphicHeight: style.getSize()[1] * style.getScale(),
                externalGraphic: this.buildGraphicPath() + this.getImageName(style.getSrc()),
                graphicOpacity: layer.getOpacity()
            };
        },
        /**
         * derives the url of the image from the server the app is running on
         * if the app is running on localhost the images from test-geofos are used
         * @return {String} path to image directory
         */
        buildGraphicPath: function () {
            var url = "https://test-geofos.fhhnet.stadt.hamburg.de/lgv-config/img",
                origin = window.location.origin;

            if (origin.indexOf("localhost") === -1) {
                url = origin + "/lgv-config/img";
            }
            return url;
        },

        buildTextStyle: function (style) {
            return {
                type: "text",
                label: style.getText(),
                fontColor: this.rgbArrayToHex(style.getFill().getColor()),
                labelXOffset: -style.getOffsetX(),
                labelYOffset: -style.getOffsetY(),
                fontSize: style.getFont().split(" ")[0],
                fontFamily: style.getFont().split(" ")[1],
                labelAlign: this.getLabelAlign(style)
            };
        },

        /**
         * gets the indicator of how to align the text with respect to the geometry.
         * this property must have 2 characters, the x-align and the y-align
         * @param {ol.style} style -
         * @returns {string} placement indicator
         */
        getLabelAlign: function (style) {
            var textAlign = style.getTextAlign();

            if (textAlign === "left") {
                // left bottom
                return "lb";
            }
            else if (textAlign === "right") {
                // right bottom
                return "rb";
            }
            // center bottom
            return "cb";
        },

        buildPolygonStyle: function (style, layer) {
            var fillStyle = style.getFill(),
                strokeStyle = style.getStroke(),
                obj = {
                    type: "polygon",
                    fillOpacity: layer.getOpacity(),
                    strokeOpacity: layer.getOpacity()
                };

            this.buildFillStyle(fillStyle, obj);
            if (strokeStyle !== null) {
                this.buildStrokeStyle(strokeStyle, obj);
            }
            return obj;
        },

        buildLineStringStyle: function (style, layer) {
            var strokeStyle = style.getStroke(),
                obj = {
                    type: "line",
                    strokeOpacity: layer.getOpacity()
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
            if (strokeColor[3] !== undefined) {
                obj.strokeOpacity = strokeColor[3];
            }
            if (_.indexOf(_.functions(style), "getWidth") !== -1 && style.getWidth() !== undefined) {
                obj.strokeWidth = style.getWidth();
            }
            return obj;
        },
        getImageName: function (imageSrc) {
            var start = imageSrc.lastIndexOf("/");

            return imageSrc.indexOf("/") !== -1 ? imageSrc.substr(start) : "/" + imageSrc;
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
         * returns the rule for styling a feature
         * @param {ol.Feature} layer -
         * @param {ol.Feature} feature -
         * @param {string} styleAttribute - the attribute by whose value the feature is styled
         * @returns {string} an ECQL Expression
         */
        getStylingRule: function (layer, feature, styleAttribute) {
            var layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.get("id")}),
                styleModel,
                labelField,
                labelValue;

            if (styleAttribute === "") {
                return "*";
            }
            // feature with geometry style and label style
            else if (layerModel !== undefined && Radio.request("StyleList", "returnModelById", layerModel.get("styleId")) !== undefined) {
                styleModel = Radio.request("StyleList", "returnModelById", layerModel.get("styleId"));

                if (styleModel !== undefined && styleModel.get("labelField").length > 0) {
                    labelField = styleModel.get("labelField");
                    labelValue = feature.get(labelField);
                    return "[" + styleAttribute + "='" + feature.get(styleAttribute) + "' AND " + labelField + "='" + labelValue + "']";
                }
                // feature with geometry style
                return "[" + styleAttribute + "='" + feature.get(styleAttribute) + "']";
            }
            // cluster feature with geometry style
            else if (feature.get("features") !== undefined) {
                return "[" + styleAttribute + "='" + feature.get("features")[0].get(styleAttribute) + "']";
            }
            // feature with geometry style
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
            var hexR,
                hexG,
                hexB,
                hexString = "#000000";

            if (_.isArray(rgb) && rgb.length >= 3) {
                hexR = this.addZero(rgb[0].toString(16));
                hexG = this.addZero(rgb[1].toString(16));
                hexB = this.addZero(rgb[2].toString(16));
                hexString = "#" + hexR + hexG + hexB;
            }

            return hexString;
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
         * @param {Boolean} isMetaDataAvailable flag to print metadata
         * @return {void}
         */
        buildLegend: function (isLegendSelected, legendParams, isMetaDataAvailable) {
            var legendObject = {},
                metaDataLayerList = [];

            if (isLegendSelected) {
                if (legendParams.length > 0) {
                    legendObject.layers = [];
                    _.each(legendParams, function (layerParam) {
                        if (isMetaDataAvailable) {
                            metaDataLayerList.push(layerParam.layername);
                        }
                        legendObject.layers.push({
                            layerName: layerParam.layername,
                            values: this.prepareLegendAttributes(layerParam)
                        });
                    }, this);
                }
            }
            this.setShowLegend(isLegendSelected);
            this.setLegend(legendObject);
            if (isMetaDataAvailable) {
                _.each(metaDataLayerList, function (layerName) {
                    this.getMetaData(layerName);
                }, this);
            }
        },
        getMetaData: function (layerName) {
            var layer = Radio.request("ModelList", "getModelByAttributes", {name: layerName}),
                metaId = layer.get("datasets") && layer.get("datasets")[0] ? layer.get("datasets")[0].md_id : null,
                uniqueId = _.uniqueId(),
                cswObj = {};

            if (!_.isNull(metaId)) {
                this.get("uniqueIdList").push(uniqueId);
                cswObj.layerName = layerName;
                cswObj.metaId = metaId;
                cswObj.keyList = ["date", "orga", "address", "email", "tel", "url"];
                cswObj.uniqueId = uniqueId;

                Radio.trigger("CswParser", "getMetaData", cswObj);
            }
        },
        prepareLegendAttributes: function (layerParam) {
            var valuesArray = [];

            if (layerParam.legend[0].typ === "WMS" || layerParam.legend[0].typ === "WFS") {
                _.each(layerParam.legend[0].img, function (url) {
                    var valueObj = {
                        legendType: "",
                        geometryType: "",
                        imageUrl: "",
                        color: "",
                        label: ""
                    };

                    if (layerParam.legend[0].typ === "WMS") {
                        valueObj.legendType = "wmsGetLegendGraphic";
                        valueObj.imageUrl = this.createLegendImageUrl("WMS", url);
                    }
                    else if (layerParam.legend[0].typ === "WFS") {
                        valueObj.legendType = "wfsImage";
                        valueObj.imageUrl = this.createLegendImageUrl("WFS", url);
                    }

                    valueObj.label = layerParam.layername;
                    valuesArray.push(valueObj);
                }, this);
            }
            else if (layerParam.legend[0].typ === "styleWMS") {
                _.each(layerParam.legend[0].params, function (styleWmsParam) {
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
        createLegendImageUrl: function (typ, path) {
            var url = path,
                image;

            if (typ === "WFS") {
                url = this.buildGraphicPath();
                image = path.substring(path.lastIndexOf("/"));
                url = url + image;
            }

            return url;
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
        },
        setUniqueIdList: function (value) {
            this.set("uniqueIdList", value);
        }
    });

    return BuildSpecModel;
});
