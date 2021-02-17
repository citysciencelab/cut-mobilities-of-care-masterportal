import {Circle as CircleStyle, Icon} from "ol/style.js";
import {Point} from "ol/geom.js";
import {fromCircle} from "ol/geom/Polygon.js";
import Feature from "ol/Feature.js";
import {GeoJSON} from "ol/format.js";
import {Image, Tile, Vector, Group} from "ol/layer.js";
import store from "../../../src/app-store/index";
import "./RadioBridge.js";
import isObject from "../../../src/utils/isObject";
import Geometry from "ol/geom/Geometry";

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
     * @fires CswParser#RadioTriggerCswParserGetMetaData
     * @listens CswParser#RadioTriggerCswParserFetchedMetaData
     */
    initialize: function () {
        this.listenTo(Radio.channel("CswParser"), {
            "fetchedMetaDataForPrint": this.fetchedMetaData
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
            if (this.get("uniqueIdList").length === 0) {
                Radio.trigger("Print", "createPrintJob", encodeURIComponent(JSON.stringify(this.toJSON())));
            }
        }
    },

    /**
     * Checks if csw request belongs to this model.
     * @param {String[]} uniqueIdList List of all metaRequest-ids belonging to this model.
     * @param {String} uniqueId Response unique-id from Cswparser.
     * @returns {Boolean} - Flag if csw response is from own metaRequest.
     */
    isOwnMetaRequest: function (uniqueIdList, uniqueId) {
        return Array.isArray(uniqueIdList) && uniqueIdList.indexOf(uniqueId) !== -1;
    },

    /**
     * Removes the uniqueId from the uniqueIdList, because the request returned something.
     * @param {String[]} uniqueIdList List of all metaRequest-ids belonging to this model.
     * @param {String} uniqueId Response unique-id from Cswparser.
     * @returns {void}
     */
    removeUniqueIdFromList: function (uniqueIdList, uniqueId) {
        this.setUniqueIdList(Radio.request("Util", "differenceJs", uniqueIdList, [uniqueId]));
    },

    /**
     * Updates the metadata from the metadata response.
     * @param {String} layerName name of layer.
     * @param {Object} parsedData parsedCswData.
     * @returns {void}
     */
    updateMetaData: function (layerName, parsedData) {
        const layers = this.get("attributes").hasOwnProperty("legend") && this.get("attributes").legend.hasOwnProperty("layers") ? this.get("attributes").legend.layers : undefined,
            layer = Radio.request("Util", "findWhereJs", layers, {layerName: layerName});

        if (layer !== undefined) {
            layer.metaDate = parsedData.hasOwnProperty("date") ? parsedData.date : "n.N.";
            layer.metaOwner = parsedData.hasOwnProperty("orgaOwner") ? parsedData.orgaOwner : "n.N.";
            layer.metaAddress = parsedData.hasOwnProperty("address") ? this.parseAddressToString(parsedData.address) : "n.N.";
            layer.metaEmail = parsedData.hasOwnProperty("email") ? parsedData.email : "n.N.";
            layer.metaTel = parsedData.hasOwnProperty("tel") ? parsedData.tel : "n.N.";
            layer.metaUrl = parsedData.hasOwnProperty("url") ? parsedData.url : "n.N.";
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
        let street,
            streetFilled = false,
            housenr,
            postalCode,
            postalCodeFilled = false,
            city,
            addressString = "";

        if (typeof addressObj === "object") {
            street = addressObj.street;
            streetFilled = this.isFilled(street);
            housenr = addressObj.housenr;
            postalCode = addressObj.postalCode;
            postalCodeFilled = this.isFilled(postalCode);
            city = addressObj.city;
        }
        if (streetFilled) {
            addressString += street;
        }
        if (this.isFilled(housenr)) {
            if (streetFilled) {
                addressString += " ";
            }
            addressString += housenr;
        }
        if (addressString !== "") {
            // newline between housenr and postalCode
            addressString += "\n ";
        }
        if (postalCodeFilled) {
            addressString += postalCode;
        }
        if (this.isFilled(city)) {
            if (postalCodeFilled) {
                addressString += " ";
            }
            addressString += city;
        }
        if (addressString.trim() === "") {
            // n.N. if addressString is empty
            addressString += "n.N.";
        }
        return addressString;
    },

    /**
     * Returns true, if the given string is not empty or undefined
     * @param {string} string to check
     * @returns {boolean} true, if string has content
     */
    isFilled: function (string) {
        return string !== undefined && string.trim() !== "";
    },


    /**
     * Defines the layers attribute of the map spec
     * @param {ol.layer.Layer[]} layerList All visible layers on the map.
     * @returns {void}
     */
    buildLayers: function (layerList) {
        const layers = [],
            attributes = this.get("attributes"),
            currentResolution = Radio.request("MapView", "getOptions").resolution;

        layerList.forEach(function (layer) {
            const printLayers = [];

            if (layer instanceof Group) {
                layer.getLayers().getArray().forEach(function (childLayer) {
                    printLayers.push(this.buildLayerType(childLayer, currentResolution));
                }.bind(this));
            }
            else {
                printLayers.push(this.buildLayerType(layer, currentResolution));
            }
            printLayers.forEach(function (printLayer) {
                if (printLayer !== undefined) {
                    layers.push(printLayer);
                }
            });
        }.bind(this));

        attributes.map.layers = layers.reverse();
    },

    /**
     * Sorts the features of the draw layer by z-index and returns the vector object for mapfish-print-3
     * @param {ol.layer}  layer   ol.Layer with features.
     * @param {ol.extent} extent  Extent uses to filter the feature by extent.
     * @returns {Object|undefined} - VectorObject for mapfish print.
     */
    getDrawLayerInfo: function (layer, extent) {
        const featuresInExtent = layer.getSource().getFeaturesInExtent(extent),
            features = Radio.request("Util", "sortBy", featuresInExtent, function (feature) {
                if (feature.getStyle() && typeof feature.getStyle === "function" && typeof feature.getStyle().getZIndex === "function") {
                    return feature.getStyle().getZIndex();
                }
                return 0;
            }),
            visibleFeatures = features.filter(feature => feature.get("isVisible"));

        if (visibleFeatures.length > 0) {
            return this.buildVector(layer, visibleFeatures);
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
        const extent = Radio.request("MapView", "getCurrentExtent"),
            layerMinRes = layer.get("minResolution"),
            layerMaxRes = layer.get("maxResolution"),
            isInScaleRange = this.isInScaleRange(layerMinRes, layerMaxRes, currentResolution);
        let features = [],
            returnLayer;

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
        const source = layer.getSource(),
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

        if (source.getParams().hasOwnProperty("SLD_BODY") && source.getParams().SLD_BODY !== undefined) {
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
        const source = layer.getSource(),
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
        const geojsonList = [];

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
        const mapfishStyleObject = {
                "version": "2"
            },
            isNewVectorStyle = Config.hasOwnProperty("useVectorStyleBeta") && Config.useVectorStyleBeta ? Config.useVectorStyleBeta : false;

        features.forEach(function (feature) {
            const styles = this.getFeatureStyle(feature, layer),
                styleAttribute = this.getStyleAttribute(layer, feature, isNewVectorStyle);

            let clonedFeature,
                stylingRule,
                styleObject,
                geometryType,
                styleGeometryFunction;

            styles.forEach(function (style, index) {
                if (style !== null) {
                    clonedFeature = feature.clone();
                    clonedFeature.set(styleAttribute, clonedFeature.get(styleAttribute) + "_" + String(index));
                    geometryType = feature.getGeometry().getType();

                    // if style has geometryFunction, take geometry from style Function
                    styleGeometryFunction = style.getGeometryFunction();
                    if (styleGeometryFunction !== null && styleGeometryFunction !== undefined) {
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
                        if (style.getImage() !== null || style.getText() !== null) {
                            styleObject.symbolizers.push(this.buildPointStyle(style, layer));
                        }
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
            }.bind(this));
        }.bind(this));
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
        else if (style.getImage() instanceof Icon && style.getImage().getScale() > 0) {
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
        const fillStyle = style.getFill(),
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
            externalGraphic: this.buildGraphicPath(style.getSrc()),
            graphicOpacity: layer.getOpacity()
        };
    },

    /**
     * derives the url of the image from the server the app is running on
     * if the app is running on localhost the images from test.geoportal-hamburg.de are used
     * @param {object} src the image source
     * @return {String} path or url to image directory
     */
    buildGraphicPath: function (src) {
        const origin = window.location.origin;
        let url = Config.wfsImgPath + this.getImageName(src);

        if (src.indexOf("http") === 0 && src.indexOf("localhost") === -1) {
            url = src;
        }
        else if (src.charAt(0) === "/") {
            url = origin + src;
        }
        else if (origin.indexOf("localhost") === -1) {
            // backwards-compatibility:
            url = origin + "/lgv-config/img" + this.getImageName(src);
        }
        return url;
    },

    /**
     * Generates the text Style
     * @param {ol.style} style Style of layer.
     * @see https://openlayers.org/en/latest/apidoc/module-ol_style_Text.html
     * @returns {Object} - Text Style for mapfish print.
     */
    buildTextStyle: function (style) {
        // use openlayers kml default font, if not set
        const font = style.getFont() ? style.getFont() : "bold 16px Helvetica",
            size = this.getFontSize(font),
            isFontSizeInFont = size !== null,
            textScale = style.getScale() ? style.getScale() : 1,
            fontSize = isFontSizeInFont ? size : 10 * textScale,
            fontFamily = isFontSizeInFont ? this.getFontFamily(font, fontSize) : font,
            fontColor = style.getFill().getColor();

        return {
            type: "text",
            label: style.getText() !== undefined ? style.getText() : "",
            fontColor: this.rgbArrayToHex(fontColor),
            fontOpacity: fontColor[0] !== "#" ? fontColor[3] : 1,
            labelOutlineColor: style.getStroke() !== null ? this.rgbArrayToHex(style.getStroke().getColor()) : undefined,
            labelXOffset: -style.getOffsetX(),
            labelYOffset: -style.getOffsetY(),
            fontSize: fontSize,
            fontFamily: fontFamily,
            labelAlign: this.getLabelAlign(style)
        };
    },

    /**
     * Inspects the given fontDef for family.
     * @param {String} fontDef the defined font
     * @param {String} fontSize the size incuding in the font
     * @returns {String} the font-family or an empty String if not contained
     */
    getFontFamily: function (fontDef, fontSize) {
        const index = fontDef ? fontDef.indexOf(" ", fontDef.indexOf(fontSize)) : -1;

        if (index > -1) {
            return fontDef.substring(index + 1);
        }
        return "";
    },
    /**
     * Inspects the given fontDef for numbers (=size).
     * @param {String} fontDef the defined font
     * @returns {String} the font-size or null if not contained
     */
    getFontSize: function (fontDef) {
        const size = fontDef ? fontDef.match(/\d/g) : null;

        if (Array.isArray(size) && size.length > 0) {
            return size.join("");
        }
        return null;
    },

    /**
     * gets the indicator of how to align the text with respect to the geometry.
     * this property must have 2 characters, the x-align and the y-align.
     * @param {ol.style} style Style of layer.
     * @returns {String} - placement indicator
     */
    getLabelAlign: function (style) {
        const textAlign = style.getTextAlign();

        if (textAlign === "left") {
            // left bottom
            return "lb";
        }
        else if (textAlign === "right") {
            // right bottom
            return "rb";
        }
        else if (textAlign === "center") {
            // center middle
            return "cm";
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
        const fillStyle = style.getFill(),
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
        const strokeStyle = style.getStroke(),
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
        let fillColor = style.getColor();

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
        const strokeColor = style.getColor();

        obj.strokeColor = this.rgbArrayToHex(strokeColor);
        if (Array.isArray(strokeColor) && strokeColor[3] !== undefined) {
            obj.strokeOpacity = strokeColor[3];
        }
        if (typeof style.getWidth === "function" && style.getWidth() !== undefined) {
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
        const start = imageSrc.lastIndexOf("/");

        return imageSrc.indexOf("/") !== -1 ? imageSrc.substr(start + 1) : "/" + imageSrc;
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
            }.bind(this));
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
        const clonedFeature = feature.clone(),
            geojsonFormat = new GeoJSON();
        let convertedFeature;

        // remove all object properties except geometry. Otherwise mapfish runs into an error
        Object.keys(clonedFeature.getProperties()).forEach(property => {
            if (isObject(clonedFeature.get(property)) && clonedFeature.get(property) instanceof Geometry === false) {
                clonedFeature.unset(property);
            }
        });
        // take over id from feature because the feature id is not set in the clone.
        clonedFeature.setId(feature.getId());
        // circle is not suppported by geojson
        if (clonedFeature.getGeometry().getType() === "Circle") {
            clonedFeature.setGeometry(fromCircle(clonedFeature.getGeometry()));
        }

        // Removing "Datastreams" attribute because it might overload the server as happened for some sensors.
        clonedFeature.unset("Datastreams", {silent: true});

        convertedFeature = geojsonFormat.writeFeatureObject(clonedFeature);
        if (clonedFeature.getGeometry().getCoordinates().length === 0) {
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
        let styles;

        if (feature.getStyleFunction() !== undefined) {
            try {
                styles = feature.getStyleFunction().call(feature);
            }
            catch (e) {
                styles = feature.getStyleFunction().call(this, feature);
            }
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
        const layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layer.get("id")}),
            styleAttr = feature.get("styleId") ? "styleId" : styleAttribute;
        let styleModel,
            labelField,
            labelValue;

        if (styleAttr === "") {
            return "*";
        }
        // cluster feature with geometry style
        else if (feature.get("features") !== undefined) {
            return "[" + styleAttr + "='" + feature.get("features")[0].get(styleAttr) + "']";
        }
        // feature with geometry style and label style
        else if (layerModel !== undefined && Radio.request("StyleList", "returnModelById", layerModel.get("styleId")) !== undefined) {
            styleModel = Radio.request("StyleList", "returnModelById", layerModel.get("styleId"));
            if (styleModel !== undefined && styleModel.get("labelField") && styleModel.get("labelField").length > 0) {
                labelField = styleModel.get("labelField");
                labelValue = feature.get(labelField);
                return "[" + styleAttr + "='" + feature.get(styleAttr) + "' AND " + labelField + "='" + labelValue + "']";
            }
            // feature with geometry style
            return "[" + styleAttr + "='" + feature.get(styleAttr) + "']";
        }
        // feature with geometry style
        return "[" + styleAttr + "='" + feature.get(styleAttr) + "']";
    },

    /**
     * @param {ol.Layer} layer -
     * @param {ol.feature} feature - the feature of current layer
     * @param {Boolean} isNewVectorStyle - check if it is the new vector style
     * @returns {String} the attribute by whose value the feature is styled
     */
    getStyleAttribute: function (layer, feature, isNewVectorStyle) {
        const layerId = layer.get("id");

        let layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
            styleField = "styleId",
            styleList,
            ruleFeature;


        if (layerModel !== undefined) {
            layerModel = this.getChildModelIfGroupLayer(layerModel, layerId);
            styleList = Radio.request("StyleList", "returnModelById", layerModel.get("styleId"));
            if (layerModel.get("styleId")) {
                if (isNewVectorStyle && styleList !== undefined) {
                    ruleFeature = styleList.getRulesForFeature(feature);
                    styleField = ruleFeature.length && ruleFeature[0] && ruleFeature[0].hasOwnProperty("conditions") ? Object.keys(ruleFeature[0].conditions.properties)[0] : "";
                }
                else {
                    styleField = styleList.get("styleField");
                }
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
        let layerModel = model;

        if (layerModel.get("typ") === "GROUP") {
            layerModel = layerModel.get("layerSource").filter(childLayer => {
                return childLayer.get("id") === layerId;
            })[0];
        }
        return layerModel;
    },

    /**
     * Converts an rgb array to hexcode. Default is the open layers default color.
     * It also checks if rgb is an hexcode, if true it will be returned.
     * @param {number[]} rgb - a rgb color represented as an array
     * @returns {string} - hex color
     */
    rgbArrayToHex: function (rgb) {
        let hexR,
            hexG,
            hexB,
            hexString = "#3399CC";

        if (Array.isArray(rgb) && rgb.length >= 3) {
            hexR = this.addZero(rgb[0].toString(16));
            hexG = this.addZero(rgb[1].toString(16));
            hexB = this.addZero(rgb[2].toString(16));
            hexString = "#" + hexR + hexG + hexB;
        }
        else if (typeof rgb === "string" && rgb.includes("#") && rgb.length >= 4) {
            hexString = rgb;
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
     * gets legend from legend vue store and builds legend object for mapfish print
     * @param  {Boolean} isLegendSelected flag if legend has to be printed
     * @param {Boolean} isMetaDataAvailable flag to print metadata
     * @return {void}
     */
    buildLegend: function (isLegendSelected, isMetaDataAvailable) {
        const legendObject = {},
            metaDataLayerList = [],
            legends = store.state.Legend.legends;

        if (isLegendSelected && legends.length > 0) {
            legendObject.layers = [];
            legends.forEach(function (legendObj) {
                const legendContainsPdf = this.legendContainsPdf(legendObj.legend);

                if (isMetaDataAvailable) {
                    metaDataLayerList.push(legendObj.name);
                }

                if (legendContainsPdf) {
                    Radio.trigger("Alert", "alert", {
                        kategorie: "alert-info",
                        text: "<b>Der Layer \"" + legendObj.name + "\" enthält eine als PDF vordefinierte Legende. " +
                            "Diese kann nicht in den Ausdruck mit aufgenommen werden.</b><br>" +
                            "Sie können sich die vordefinierte Legende aus der Legende im Menü separat herunterladen."
                    });
                }
                else {
                    legendObject.layers.push({
                        layerName: legendObj.name,
                        values: this.prepareLegendAttributes(legendObj.legend)
                    });
                }
            }.bind(this));
        }

        this.setShowLegend(isLegendSelected);
        this.setLegend(legendObject);
        if (isMetaDataAvailable && metaDataLayerList.length > 0) {
            metaDataLayerList.forEach(function (layerName) {
                this.getMetaData(layerName);
            }.bind(this));
        }
        else {
            Radio.trigger("Print", "createPrintJob", encodeURIComponent(JSON.stringify(this.toJSON())));
        }
    },

    legendContainsPdf: function (legend) {
        return legend.some(legendPart => {
            let isPdf = false;

            if (typeof legendPart === "object") {
                isPdf = legendPart.graphic.endsWith(".pdf");
            }
            else {
                isPdf = legendPart.endsWith(".pdf");
            }
            return isPdf;
        });
    },

    /**
     * Requests the metadata for given layer name
     * @param {String} layerName name of current layer
     * @fires CswParser#RadioTriggerCswParserGetMetaData
     * @returns {void}
     */
    getMetaData: function (layerName) {
        const layer = Radio.request("ModelList", "getModelByAttributes", {name: layerName}),
            metaId = layer.get("datasets") && layer.get("datasets")[0] ? layer.get("datasets")[0].md_id : null,
            uniqueId = Radio.request("Util", "uniqueId"),
            cswObj = {};

        if (metaId !== null) {
            this.get("uniqueIdList").push(uniqueId);
            cswObj.layerName = layerName;
            cswObj.metaId = metaId;
            cswObj.keyList = ["date", "orgaOwner", "address", "email", "tel", "url"];
            cswObj.uniqueId = uniqueId;

            Radio.trigger("CswParser", "getMetaDataForPrint", cswObj, layer);
        }
    },

    /**
     * Prepares Attributes for legend in mapfish-print template
     * @param {Object} legend Legend of layer.
     * @returns {Object[]} - prepared legend attributes.
     */
    prepareLegendAttributes: function (legend) {
        const valuesArray = [];

        legend.forEach(legendPart => {
            const legendObj = {
                    legendType: "",
                    geometryType: "",
                    imageUrl: "",
                    color: "",
                    label: legendPart.name
                },
                graphic = typeof legendPart === "object" ? legendPart.graphic : legendPart;

            if (graphic.toUpperCase().includes("GETLEGENDGRAPHIC")) {
                legendObj.legendType = "wmsGetLegendGraphic";
                legendObj.imageUrl = graphic;
            }
            else if (graphic.indexOf("<svg") !== -1) {
                legendObj.color = this.getFillColorFromSVG(graphic);
                legendObj.legendType = "geometry";
                legendObj.geometryType = "polygon";
            }
            else {
                legendObj.legendType = "wfsImage";
                legendObj.imageUrl = graphic;
            }
            if (typeof legendObj.color !== "undefined") {
                valuesArray.push(legendObj);
            }
        });
        return [].concat(...valuesArray);
    },

    /**
     * Returns Fill color from SVG as hex.
     * @param {String} svgString String of SVG.
     * @returns {String} - Fill color from SVG.
     */
    getFillColorFromSVG: function (svgString) {
        if (svgString.split(/fill:(.+)/)[1]) {
            return svgString.split(/fill:(.+)/)[1].split(/;(.+)/)[0];
        }
        return undefined;
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
        const gfiObject = {};
        let gfiAttributes,
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
        const geojsonFormat = new GeoJSON(),
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
        const valuesArray = [];
        let key;

        for (key in gfiAttributes) {
            valuesArray.push({
                key: key,
                value: gfiAttributes[key]
            });
        }

        return valuesArray;
    },

    /**
     * Creates the scale string.
     * @param {String} scale Scale of map.
     * @returns {void}
     */
    buildScale: function (scale) {
        const scaleText = "1:" + scale;

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
