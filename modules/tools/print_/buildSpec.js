import {Circle as CircleStyle, Icon} from "ol/style.js";
import {Point} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import Feature from "ol/Feature.js";
import {GeoJSON} from "ol/format.js";
import {Image, Tile, Vector, Group} from "ol/layer.js";

const BuildSpecModel = Backbone.Model.extend(/** @lends BuildSpecModel.prototype */{
    defaults: {
        uniqueIdList: []
    },
    /**
     * Model to generate the buildSpec JSON that is send to the mapfish-print-3 service.
     * @class BuildSpecModel.
     * @memberof Tools.Print
     * @extends Backbone.Model
     * @constructs
     * @fires CswParser#RadioTriggerGetMetaData
     * @listens CswParser#RadioTriggerFetchedMetaData
     */
    initialize: function () {
        this.listenTo(Radio.channel("CswParser"), {
            "fetchedMetaData": this.fetchedMetaData
        });
    },

    /**
     * Fetches the metadata object and checks if object is from own request.
     * If so it removes the unique id from the unique id list.
     * @param {Object} cswObj Object from csw parser.
     * @returns {void}
     */
    fetchedMetaData: function (cswObj) {
        if (this.isOwnMetaRequest(this.get("uniqueIdList"), cswObj.uniqueId)) {
            this.removeUniqueIdFromList(this.get("uniqueIdList"), cswObj.uniqueId);
            this.updateMetaData(cswObj.layerName, cswObj.parsedData);
        }
    },

    /**
     * Checks if csw request belongs to this model.
     * @param {String[]} uniqueIdList List of all metaRequest-ids belonging to this model.
     * @param {String} uniqueId Response unique-id from Cswparser.
     * @returns {Boolean} - Flag if csw response is from own metaRequest.
     */
    isOwnMetaRequest: function (uniqueIdList, uniqueId) {
        return _.contains(uniqueIdList, uniqueId);
    },

    /**
     * Removes the uniqueId from the uniqueIdList, because the request returned something.
     * @param {String[]} uniqueIdList List of all metaRequest-ids belonging to this model.
     * @param {String} uniqueId Response unique-id from Cswparser.
     * @returns {void}
     */
    removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
        this.setUniqueIdList(_.without(uniqueIdList, uniqueId));
    },

    /**
     * Updates the metadata from the metadata response.
     * @param {String} layerName name of layer.
     * @param {Object} parsedData parsedCswData.
     * @returns {void}
     */
    updateMetaData: function (layerName, parsedData) {
        var layers = _.has(this.get("attributes"), "legend") && _.has(this.get("attributes").legend, "layers") ? this.get("attributes").legend.layers : undefined,
            layer = _.findWhere(layers, {layerName: layerName});

        if (!_.isUndefined(layer)) {
            layer.metaDate = _.has(parsedData, "date") ? parsedData.date : "n.N.";
            layer.metaOwner = _.has(parsedData, "orgaOwner") ? parsedData.orgaOwner : "n.N.";
            layer.metaAddress = _.has(parsedData, "address") ? this.parseAddressToString(parsedData.address) : "n.N.";
            layer.metaEmail = _.has(parsedData, "email") ? parsedData.email : "n.N.";
            layer.metaTel = _.has(parsedData, "tel") ? parsedData.tel : "n.N.";
            layer.metaUrl = _.has(parsedData, "url") ? parsedData.url : "n.N.";
        }
    },

    /**
     * Parses the address object to a string.
     * @param {Object} addressObj Address Object
     * @param {String} addressObj.street Street name.
     * @param {String} addressObj.housenr House number.
     * @param {String} addressObj.postalCode Postal Code.
     * @param {String} addressObj.city City.
     * @returns {String} - The parsed String.
     */
    parseAddressToString: function (addressObj) {
        var street = _.isUndefined(addressObj) ? undefined : addressObj.street,
            housenr = _.isUndefined(addressObj) ? undefined : addressObj.housenr,
            postalCode = _.isUndefined(addressObj) ? undefined : addressObj.postalCode,
            city = _.isUndefined(addressObj) ? undefined : addressObj.city,
            addressString = "";

        // street
        addressString += _.isUndefined(street) ? "" : street;
        // blank between  street and housenr
        addressString += addressString === "" ? "" : " ";
        // housenr
        addressString += _.isUndefined(housenr) ? "" : housenr;
        // newline between housenr and postalCode
        addressString += addressString === "" ? "" : addressString + "\n ";
        // postalCode
        addressString += _.isUndefined(postalCode) ? "" : postalCode;
        // blank between postalCode and City
        addressString += addressString === "" ? "" : " ";
        // city
        addressString += _.isUndefined(city) ? "" : city;
        // n.N. if addressString is empty
        addressString += addressString === "" ? "n.N." : "";

        return addressString;
    },

    /**
     * Defines the layers attribute of the map spec
     * @param {ol.layer.Layer[]} layerList All visible layers on the map.
     * @returns {void}
     */
    buildLayers: function (layerList) {
        var layers = [],
            attributes = this.get("attributes"),
            currentResolution = Radio.request("MapView", "getOptions").resolution;

        layerList.forEach(function (layer) {
            var printLayers = [];

            if (layer instanceof Group) {
                _.each(layer.getLayers().getArray(), function (childLayer) {
                    printLayers.push(this.buildLayerType(childLayer, currentResolution));
                }, this);
            }
            else {
                printLayers.push(this.buildLayerType(layer, currentResolution));
            }
            _.each(printLayers, function (printLayer) {
                if (!_.isUndefined(printLayer)) {
                    layers.push(printLayer);
                }
            });
        }, this);

        attributes.map.layers = layers.reverse();
    },

    /**
     * Sorts the features of the draw layer by z-index and returns the vector object for mapfish-print-3
     * @param {ol.layer}  layer   ol.Layer with features.
     * @param {ol.extent} extent  Extent uses to filter the feature by extent.
     * @returns {Object|undefined} - VectorObject for mapfish print.
     */
    getDrawLayerInfo: function (layer, extent) {
        var featuresInExtent = layer.getSource().getFeaturesInExtent(extent),
            features = _.sortBy(featuresInExtent, function (feature) {
                return feature.getStyle().getZIndex();
            });

        if (features.length > 0) {
            return this.buildVector(layer, features);
        }

        return undefined;
    },

    /**
     * returns layerinfoy by layer type
     * @param  {ol.layer} layer ol.Layer with deatures
     * @param {Number} currentResolution Current map resolution
     * @returns {Object} - LayerObject for mapfish print.
     */
    buildLayerType: function (layer, currentResolution) {
        var features = [],
            extent = Radio.request("MapView", "getCurrentExtent"),
            returnLayer,
            layerMinRes = layer.get("minResolution"),
            layerMaxRes = layer.get("maxResolution"),
            isInScaleRange = this.isInScaleRange(layerMinRes, layerMaxRes, currentResolution);

        if (isInScaleRange) {
            if (layer instanceof Image) {
                returnLayer = this.buildImageWms(layer);
            }
            else if (layer instanceof Tile) {
                returnLayer = this.buildTileWms(layer);
            }
            else if (layer.get("name") === "import_draw_layer") {
                returnLayer = this.getDrawLayerInfo(layer, extent);
            }
            else if (layer instanceof Vector) {
                features = layer.getSource().getFeaturesInExtent(extent);
                if (features.length > 0) {
                    returnLayer = this.buildVector(layer, features);
                }
            }
        }
        return returnLayer;
    },

    /**
     * Checks if layer is in the visible resolution range.
     * @param {Number} layerMinRes Maximum resolution of layer.
     * @param {Number} layerMaxRes Minimum resolution of layer.
     * @param {Number} currentResolution Current map resolution.
     * @returns {Boolean} - Flag if layer is in visible resolution.
     */
    isInScaleRange: function (layerMinRes, layerMaxRes, currentResolution) {
        let isInScale = false;

        if (layerMinRes <= currentResolution && layerMaxRes >= currentResolution) {
            isInScale = true;
        }

        return isInScale;
    },

    /**
     * returns tile wms layer information
     * @param {ol.layer.Tile} layer tile layer with tile wms source
     * @returns {Object} - wms layer spec
     */
    buildTileWms: function (layer) {
        var source = layer.getSource(),
            mapObject = {
                baseURL: source.getUrls()[0],
                opacity: layer.getOpacity(),
                type: "WMS",
                layers: source.getParams().LAYERS.split(","),
                styles: source.getParams().STYLES ? source.getParams().STYLES.split(",") : undefined,
                imageFormat: source.getParams().FORMAT,
                customParams: {
                    "TRANSPARENT": source.getParams().TRANSPARENT
                }
            };

        if (_.has(source.getParams(), "SLD_BODY") && !_.isUndefined(source.getParams().SLD_BODY)) {
            mapObject.customParams.SLD_BODY = source.getParams().SLD_BODY;
            mapObject.styles = ["style"];
        }
        return mapObject;
    },

    /**
     * Returns image wms layer information
     * @param {ol.layer.Image} layer - image layer with image wms source
     * @returns {Object} - wms layer spec
     */
    buildImageWms: function (layer) {
        var source = layer.getSource(),
            mapObject = {
                baseURL: source.getUrl(),
                opacity: layer.getOpacity(),
                type: "WMS",
                layers: source.getParams().LAYERS.split(","),
                styles: source.getParams().STYLES ? source.getParams().STYLES.split(",") : undefined,
                imageFormat: source.getParams().FORMAT,
                customParams: {
                    "TRANSPARENT": source.getParams().TRANSPARENT
                }
            };

        return mapObject;
    },

    /**
     * returns vector layer information
     * @param {ol.layer.Vector} layer vector layer with vector source
     * @param {ol.feature[]} features vectorfeatures
     * @returns {object} - geojson layer spec
    */
    buildVector: function (layer, features) {
        var geojsonList = [];

        return {
            type: "geojson",
            style: this.buildStyle(layer, features, geojsonList),
            geojson: geojsonList
        };
    },

    /**
     * Generates the style for mapfish print.
     * @param {ol.layer} layer ol-Layer with features.
     * @param {ol.feature[]} features Array of features.
     * @param {Object[]} geojsonList Array of geojsons.
     * @returns {Object} - style for mapfish print.
     */
    buildStyle: function (layer, features, geojsonList) {
        var mapfishStyleObject = {
                "version": "2"
            },
            styleAttribute = this.getStyleAttribute(layer);

        features.forEach(function (feature) {
            var clonedFeature,
                styles = this.getFeatureStyle(feature, layer),
                stylingRule,
                styleObject,
                geometryType,
                styleGeometryFunction;

            _.each(styles, function (style, index) {
                if (style !== null) {
                    clonedFeature = feature.clone();
                    clonedFeature.set(styleAttribute, clonedFeature.get(styleAttribute) + "_" + String(index));
                    geometryType = feature.getGeometry().getType();

                    // if style has geometryFunction, take geometry from style Function
                    styleGeometryFunction = style.getGeometryFunction();
                    if (!_.isNull(styleGeometryFunction) && !_.isUndefined(styleGeometryFunction)) {
                        clonedFeature.setGeometry(styleGeometryFunction(clonedFeature));
                        geometryType = styleGeometryFunction(clonedFeature).getType();
                    }

                    this.addFeatureToGeoJsonList(clonedFeature, geojsonList);
                    stylingRule = this.getStylingRule(layer, clonedFeature, styleAttribute);
                    // do nothing if we already have a style object for this CQL rule
                    if (mapfishStyleObject.hasOwnProperty(stylingRule)) {
                        return;
                    }
                    styleObject = {
                        symbolizers: []
                    };
                    if (geometryType === "Point" || geometryType === "MultiPoint") {
                        styleObject.symbolizers.push(this.buildPointStyle(style, layer));
                    }
                    else if (geometryType === "Polygon" || geometryType === "MultiPolygon") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style, layer));
                    }
                    else if (geometryType === "Circle") {
                        styleObject.symbolizers.push(this.buildPolygonStyle(style, layer));
                    }
                    else if (geometryType === "LineString" || geometryType === "MultiLineString") {
                        styleObject.symbolizers.push(this.buildLineStringStyle(style, layer));
                    }
                    // label styling
                    if (style.getText() !== null && style.getText() !== undefined) {
                        styleObject.symbolizers.push(this.buildTextStyle(style.getText()));
                    }
                    mapfishStyleObject[stylingRule] = styleObject;
                }
            }, this);
        }, this);
        return mapfishStyleObject;
    },

    /**
     * Generates the point Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Point Style for mapfish print.
     */
    buildPointStyle: function (style, layer) {
        if (style.getImage() instanceof CircleStyle) {
            return this.buildPointStyleCircle(style.getImage());
        }
        else if (style.getImage() instanceof Icon) {
            return this.buildPointStyleIcon(style.getImage(), layer);
        }
        return this.buildTextStyle(style.getText());
    },

    /**
     * Generates the point Style for circle style
     * @param {ol.style} style Style of layer.
     * @returns {Object} - Circle Style for mapfish print.
     */
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

    /**
     * Generates the point Style for icons
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Icon Style for mapfish print.
     */
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

    /**
     * Generates the text Style
     * @param {ol.style} style Style of layer.
     * @returns {Object} - Text Style for mapfish print.
     */
    buildTextStyle: function (style) {
        return {
            type: "text",
            label: !_.isUndefined(style.getText()) ? style.getText() : "",
            fontColor: this.rgbArrayToHex(style.getFill().getColor()),
            labelOutlineColor: !_.isNull(style.getStroke()) ? this.rgbArrayToHex(style.getStroke().getColor()) : undefined,
            labelXOffset: -style.getOffsetX(),
            labelYOffset: -style.getOffsetY(),
            fontSize: style.getFont().split(" ")[0],
            fontFamily: style.getFont().split(" ")[1],
            labelAlign: this.getLabelAlign(style)
        };
    },

    /**
     * gets the indicator of how to align the text with respect to the geometry.
     * this property must have 2 characters, the x-align and the y-align.
     * @param {ol.style} style Style of layer.
     * @returns {String} - placement indicator
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

    /**
     * Generates the polygon Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - Polygon Style for mapfish print.
     */
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


    /**
     * Generates the LineString Style
     * @param {ol.style} style Style of layer.
     * @param {ol.layer} layer Ol-layer.
     * @returns {Object} - LineString Style for mapfish print.
     */
    buildLineStringStyle: function (style, layer) {
        var strokeStyle = style.getStroke(),
            obj = {
                type: "line",
                strokeOpacity: layer.getOpacity()
            };

        this.buildStrokeStyle(strokeStyle, obj);
        return obj;
    },


    /**
     * Generates the Fill Style
     * @param {ol.style} style Style of layer.
     * @param {Object} obj current style object .
     * @returns {Object} - Fill Style for mapfish print.
     */
    buildFillStyle: function (style, obj) {
        var fillColor = style.getColor();

        if (typeof fillColor === "string") {
            fillColor = this.colorStringToRgbArray(fillColor);
        }

        obj.fillColor = this.rgbArrayToHex(fillColor);
        obj.fillOpacity = fillColor[3];

        return obj;
    },

    /**
     * Checks if colorString starts with "rgb" then calls a parsing function.
     * @param {String} colorString rgb or rgba string
     * @returns {Number[] | String} - parsed rgb-string as number array
     */
    colorStringToRgbArray: function (colorString) {
        const parsedString = colorString;
        let parsedArray;

        if (parsedString.match(/^(rgb)/)) {
            parsedArray = this.rgbStringToRgbArray(parsedString);
        }
        return parsedArray;
    },

    /**
     * Parses a given rgb- or rgba-string to an numbers array.
     * @param {String} colorString rgb or rgba string
     * @returns {Number[]} - parsed rgb-string as number array
     */
    rgbStringToRgbArray: function (colorString) {
        const indexOpenBracket = colorString.indexOf("(") + 1,
            indexCloseBracket = colorString.indexOf(")"),
            length = indexCloseBracket - indexOpenBracket,
            valuesString = colorString.substr(indexOpenBracket, length),
            rgbaStringArray = valuesString.split(","),
            rgbaArray = [];

        rgbaStringArray.forEach(function (colorValue) {
            colorValue.trim();
            rgbaArray.push(parseFloat(colorValue));
        });

        return rgbaArray;
    },

    /**
     * Generates the Stroke Style
     * @param {ol.style} style Style of layer.
     * @param {Object} obj Style object for mapfish print.
     * @returns {Object} - LineString Style for mapfish print.
     */
    buildStrokeStyle: function (style, obj) {
        var strokeColor;

        strokeColor = style.getColor();
        obj.strokeColor = this.rgbArrayToHex(strokeColor);
        if (_.isArray(strokeColor) && strokeColor[3] !== undefined) {
            obj.strokeOpacity = strokeColor[3];
        }
        if (_.indexOf(_.functions(style), "getWidth") !== -1 && style.getWidth() !== undefined) {
            obj.strokeWidth = style.getWidth();
        }
        return obj;
    },

    /**
     * Returns the image name of the src url.
     * @param {String} imageSrc Url of image source
     * @returns {String} - Image name.
     */
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
        let convertedFeature;

        if (feature.get("features") !== undefined) {
            feature.get("features").forEach(function (clusteredFeature) {
                convertedFeature = this.convertFeatureToGeoJson(clusteredFeature);

                if (convertedFeature) {
                    geojsonList.push(convertedFeature);
                }
            }, this);
        }
        else {
            convertedFeature = this.convertFeatureToGeoJson(feature);

            if (convertedFeature) {
                geojsonList.push(convertedFeature);
            }
        }
    },

    /**
     * converts an openlayers feature to a GeoJSON feature object
     * @param {ol.Feature} feature - the feature to convert
     * @returns {object} GeoJSON object
     */
    convertFeatureToGeoJson: function (feature) {
        var geojsonFormat = new GeoJSON(),
            convertedFeature;

        // circle is not suppported by geojson
        if (feature.getGeometry().getType() === "Circle") {
            feature.setGeometry(fromCircle(feature.getGeometry()));
        }
        convertedFeature = geojsonFormat.writeFeatureObject(feature);

        if (feature.getGeometry().getCoordinates().length === 0) {
            convertedFeature = undefined;
        }
        return convertedFeature;
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
        // cluster feature with geometry style
        else if (feature.get("features") !== undefined) {
            return "[" + styleAttribute + "='" + feature.get("features")[0].get(styleAttribute) + "']";
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
        // feature with geometry style
        return "[" + styleAttribute + "='" + feature.get(styleAttribute) + "']";
    },

    /**
     * @param {ol.Layer} layer -
     * @returns {string} the attribute by whose value the feature is styled
     */
    getStyleAttribute: function (layer) {
        var layerId = layer.get("id"),
            layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
            styleField = "styleId";

        if (layerModel !== undefined) {
            layerModel = this.getChildModelIfGroupLayer(layerModel, layerId);
            if (layerModel.get("styleId")) {
                styleField = Radio.request("StyleList", "returnModelById", layerModel.get("styleId")).get("styleField");
            }
        }

        return styleField;
    },

    /**
     * Checks if model is a Group Model.
     * If so, then the child model corresponding to layerId is returned.
     * Otherwise the model is returned
     * @param  {Backbone.Model} model Layer model from ModelList
     * @param  {String} layerId Id of layer model to return
     * @return {Backbone.Model} found layer model
     */
    getChildModelIfGroupLayer: function (model, layerId) {
        var layerModel = model;

        if (layerModel.get("typ") === "GROUP") {
            layerModel = _.filter(layerModel.get("layerSource"), function (childLayer) {
                return childLayer.get("id") === layerId;
            })[0];
        }
        return layerModel;
    },

    /**
     * Converts an rgb array to hexcode. Default is the open layers default color.
     * @param {number[]} rgb - a rgb color represented as an array
     * @returns {string} - hex color
     */
    rgbArrayToHex: function (rgb) {
        var hexR,
            hexG,
            hexB,
            hexString = "#3399CC";

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
     * @param  {Object[]}  legendParams params derived from legend module
     * @param {Boolean} isMetaDataAvailable flag to print metadata
     * @return {void}
     */
    buildLegend: function (isLegendSelected, legendParams, isMetaDataAvailable) {
        var legendObject = {},
            metaDataLayerList = [];

        if (isLegendSelected && legendParams.length > 0) {
            legendObject.layers = [];
            _.each(legendParams, function (layerParam) {
                if (isMetaDataAvailable) {
                    metaDataLayerList.push(layerParam.layername);
                }
                if (layerParam.legend[0].hasOwnProperty("img") && layerParam.legend[0].img.indexOf(".pdf") !== -1) {
                    Radio.trigger("Alert", "alert", {
                        kategorie: "alert-info",
                        text: "<b>Der Layer \"" + layerParam.layername + "\" enthält eine als PDF vordefinierte Legende. " +
                            "Diese kann nicht in den Ausdruck mit aufgenommen werden.</b><br>" +
                            "Sie können sich die vordefinierte Legende <a href='" + layerParam.legend[0].img + "' target='_blank'><b>hier</b></a> separat herunterladen."
                    });
                }
                else {
                    legendObject.layers.push({
                        layerName: layerParam.layername,
                        values: this.prepareLegendAttributes(layerParam)
                    });
                }
            }, this);
        }

        this.setShowLegend(isLegendSelected);
        this.setLegend(legendObject);
        if (isMetaDataAvailable) {
            _.each(metaDataLayerList, function (layerName) {
                this.getMetaData(layerName);
            }, this);
        }
    },

    /**
     * Requests the metadata for given layer name
     * @param {String} layerName name of current layer
     * @fires CswParser#RadioTriggerGetMetaData
     * @returns {void}
     */
    getMetaData: function (layerName) {
        var layer = Radio.request("ModelList", "getModelByAttributes", {name: layerName}),
            metaId = layer.get("datasets") && layer.get("datasets")[0] ? layer.get("datasets")[0].md_id : null,
            uniqueId = _.uniqueId(),
            cswObj = {};

        if (!_.isNull(metaId)) {
            this.get("uniqueIdList").push(uniqueId);
            cswObj.layerName = layerName;
            cswObj.metaId = metaId;
            cswObj.keyList = ["date", "orgaOwner", "address", "email", "tel", "url"];
            cswObj.uniqueId = uniqueId;

            Radio.trigger("CswParser", "getMetaData", cswObj);
        }
    },

    /**
     * Prepares Attributes for legend in mapfish-print template
     * @param {Object} layerParam Params of layer.
     * @returns {Object[]} - prepared legend attributes.
     */
    prepareLegendAttributes: function (layerParam) {
        var valuesArray = [],
            typ = layerParam.legend[0].typ;

        if (typ === "WMS") {
            valuesArray.push(this.createWmsLegendList(layerParam.legend[0].img));
        }
        else if (typ === "WFS") {
            valuesArray.push(this.createWfsLegendList(layerParam.legend[0].img, layerParam.legend[0].legendname, layerParam.layerName));
        }
        else if (typ === "styleWMS") {
            valuesArray.push(this.createStyleWmsLegendList(layerParam.legend[0].params));
        }

        return _.flatten(valuesArray);
    },

    /**
     * Creates the wms legend list for mapfish print
     * @param {String[]} urls params for wms legend cration.
     * @returns {Object[]} - prepared wms legens for mapfish print.
     */
    createWmsLegendList: function (urls) {
        var wmsLegendList = [],
            legendUrls = urls;

        if (typeof urls === "string") {
            legendUrls = [legendUrls];
        }

        _.each(legendUrls, function (url) {
            var wmsLegendObject = {
                legendType: "wmsGetLegendGraphic",
                geometryType: "",
                imageUrl: url,
                color: "",
                label: ""
            };

            wmsLegendList.push(wmsLegendObject);
        }, this);
        return wmsLegendList;
    },

    /**
     * Creates wfs legend list for mapfish print
     * @param {String|String[]} urls Urls of legends.
     * @param {String[]} legendNames Names of legend.
     * @param {String} layerName Name of layer.
     * @returns {Object[]} - List of wfs legends to mapfish print template.
     */
    createWfsLegendList: function (urls, legendNames, layerName) {
        var wfsLegendList = [],
            wfsLegendObject;

        if (_.isString(urls)) {
            wfsLegendObject = this.createWfsLegendObject(urls, layerName);
            wfsLegendList.push(wfsLegendObject);
        }
        else {
            _.each(urls, function (url, index) {
                wfsLegendObject = this.createWfsLegendObject(url, legendNames[index]);
                wfsLegendList.push(wfsLegendObject);
            }, this);
        }
        return wfsLegendList;
    },

    /**
     * Creates legend object for wfs layer for mapfish print
     * @param {String} url Url of image.
     * @param {String} label Label.
     * @returns {Object} - wfs legend object
     */
    createWfsLegendObject: function (url, label) {
        var wfsLegendObject = {
            legendType: "",
            geometryType: "",
            imageUrl: "",
            color: "",
            label: label
        };

        if (url.indexOf("<svg") !== -1) {
            wfsLegendObject.color = this.getFillFromSVG(url);
            wfsLegendObject.legendType = "geometry";
            wfsLegendObject.geometryType = "polygon";
        }
        else {
            wfsLegendObject.legendType = "wfsImage";
            wfsLegendObject.imageUrl = this.createLegendImageUrl(url);
        }
        return wfsLegendObject;
    },

    /**
     * Creates a legend list for all style wms styyled layers.
     * @param {Object[]} legendObjects Special styleWMS params
     * @returns {Object[]} - legend list from stlyed wms layer for mapfish print.
     */
    createStyleWmsLegendList: function (legendObjects) {
        var styleWmsLegendList = [];

        _.each(legendObjects, function (styleWmsParam) {
            styleWmsLegendList.push({
                legendType: "geometry",
                geometryType: "polygon",
                imageUrl: "",
                color: styleWmsParam.color,
                label: styleWmsParam.startRange + " - " + styleWmsParam.stopRange
            });
        });
        return styleWmsLegendList;
    },
    /**
     * Returns Fill color from SVG as hex.
     * @param {String} svgString String of SVG.
     * @returns {String} - Fill color as hex.
     */
    getFillFromSVG: function (svgString) {
        var indexOfFill = svgString.indexOf("fill:") + 5,
            hexLength = 6 + 1,
            hexColor = "#000000";

        if (svgString.indexOf("fill:") !== -1) {
            hexColor = svgString.substring(indexOfFill, indexOfFill + hexLength);
        }
        return hexColor;
    },

    /**
     * Creates the legend image url.
     * @param {String} path Path.
     * @returns {String} - Url for legend path.
     */
    createLegendImageUrl: function (path) {
        var url = path,
            image;

        if (url.indexOf("http") === -1) {
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
     * @param  {Array} gfiArray array
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
     * @param {Object[]} layers - layers attribute of the map spec
     * @param {number[]} coordinates - the coordinates of the gfi
     * @returns {void}
     */
    addGfiFeature: function (layers, coordinates) {
        var geojsonFormat = new GeoJSON(),
            gfiFeature = new Feature({
                geometry: new Point(coordinates),
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
     * @param  {Object} gfiAttributes gfi Mapping attributes
     * @return {Object[]} parsed array[objects] with key- and value attributes
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

    /**
     * Creates the scale string.
     * @param {String} scale Scale of map.
     * @returns {void}
     */
    buildScale: function (scale) {
        var scaleText = "1:" + scale;

        this.setScale(scaleText);
    },

    /**
     * Setter for Metadata
     * @param {String} value Value
     * @returns {void}
     */
    setMetadata: function (value) {
        this.get("attributes").metadata = value;
    },

    /**
     * Setter for showLegend
     * @param {Boolean} value Value
     * @returns {void}
     */
    setShowLegend: function (value) {
        this.get("attributes").showLegend = value;
    },

    /**
     * Setter for Legend
     * @param {String} value Value
     * @returns {void}
     */
    setLegend: function (value) {
        this.get("attributes").legend = value;
    },

    /**
     * Setter for showGfi
     * @param {Boolean} value Value
     * @returns {void}
     */
    setShowGfi: function (value) {
        this.get("attributes").showGfi = value;
    },

    /**
     * Setter for gfi
     * @param {String} value Value
     * @returns {void}
     */
    setGfi: function (value) {
        this.get("attributes").gfi = value;
    },

    /**
     * Setter for scale
     * @param {String} value Value
     * @returns {void}
     */
    setScale: function (value) {
        this.get("attributes").scale = value;
    },

    /**
     * Setter for uniqueIdList
     * @param {String} value Value
     * @returns {void}
     */
    setUniqueIdList: function (value) {
        this.set("uniqueIdList", value);
    }
});

export default BuildSpecModel;
