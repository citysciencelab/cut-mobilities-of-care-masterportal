import Tool from "../../core/modelList/tool/model";
import {Icon} from "ol/style.js";
import {Circle, Polygon} from "ol/geom.js";
import {DEVICE_PIXEL_RATIO} from "ol/has.js";

const PrintModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        // available layouts of the specified print configuration
        layoutList: [],
        currentLayout: undefined,
        // available scales of the specified print configuration
        scaleList: [],
        // current print scale
        currentScale: undefined,
        // available formats of the specified print configuration
        formatList: [],
        currentFormat: "pdf",
        // true if the current layout supports legend
        isLegendAvailable: false,
        // true if the current layout supports gfi
        isGfiAvailable: false,
        // true if gfi is active
        isGfiActive: false,
        // true if gfi is to be printed
        isGfiSelected: false,
        // is scale selected by the user over the view
        isScaleSelectedManually: false,
        // true if the current layout supports meta data
        isMetaDataAvailable: false,
        // true if the current layout supports scale
        isScaleAvailable: false,
        eventListener: {},
        printID: "99999",
        title: "PrintResult",
        outputFilename: "Ausdruck",
        outputFormat: "pdf",
        // gfiToPrint: [], //  visible GFIs
        center: [],
        scale: {},
        layerToPrint: [],
        gfi: false,
        printurl: "",
        gfiMarker: {
            outerCircle: {
                fill: false,
                pointRadius: 8,
                stroke: true,
                strokeColor: "#ff0000",
                strokeWidth: 3
            },
            point: {
                fill: true,
                pointRadius: 1,
                fillColor: "#000000",
                stroke: false
            }
        },
        proxyURL: "",
        glyphicon: "glyphicon-print",
        precomposeListener: {},
        postcomposeListener: {},
        MM_PER_INCHES: 25.4,
        POINTS_PER_INCH: 72,
        DOTS_PER_INCH: 72,
        INCHES_PER_METER: 39.37
    }),

    /**
     * @class PrintModel
     * @extends Tool
     * @memberof print_
     * @constructs
     * @property {Array} layoutList=[] - Array for all available layouts from plot service
     * @property {undefined} currentLayout=undefined - Holder for the current selected layout
     * @property {Array} scaleList=[] - Array for all available scales from plot service
     * @property {undefined} currentScale=undefined - Holder for the current selected scale
     * @property {Array} formatList=[] - Array for all available formats from plot service
     * @property {String} currentFormat="pdf" - Holder for the current selcted format
     * @property {Boolean} isLegendAvailable=false - Flag if the current layout supports legend
     * @property {Boolean} isGfiAvailable=false - Flag if the current layout supports gfi
     * @property {Boolean} isGfiActive=false - Flag if gfi is active
     * @property {Boolean} isGfiSelected=false - Flag if gfi is to be printed
     * @property {Boolean} isScaleSelectedManually=false - Flag if scale is selected by the user
     * @property {Boolean} isMetaDataAvailable=false - Flag if the current layout supports meta data
     * @property {Boolean} isScaleAvailable=false - Flag if the current layout supports scale
     * @property {Object} eventListener={} - Holder for an eventListener
     * @property {String} printID="99999" - Service id for the plot service
     * @property {String} title="PrintResult" - Initial tilte for the print page
     * @property {String} outputFilename="Ausdruck" - Filename for print page
     * @property {String} outputFormat="pdf" - Format for file of print page
     * @property {Array} center=[] - Array for center coordinates of the map
     * @property {Object} scale={} - Holder for the print scale
     * @property {Array} layerToPrint=[] - Array for all layers to be printed
     * @property {Boolean} gfi=false - Flag if gfi is supported
     * @property {String} printurl="" - Url to plot service
     * @property {Object} gfiMarker - Style settings for an gfi marker
     * @property {String} proxyURL="" - Url to the proxy
     * @property {String} glyphicon="glyphicon-print" - Icon for the print button
     * @property {Object} precomposeListener={} - Holder for an PrecomposeListener
     * @property {Object} postcomposeListener={} - Holder for an PostcomposeListener
     * @property {Number} MM_PER_INCHES=25.4 - Millimeter per inches
     * @property {Number} POINTS_PER_INCH=72 - Points per Inch
     * @property {Number} DOTS_PER_INCH=72 - Dots per inch
     * @property {Number} INCHES_PER_METER=39.37 - Inches per meter
     * @listens Print#RadioTriggerPrintChangeIsAvtive
     * @listens Print#RadioTriggerPrintChangeSpecification
     * @listens MapView#RadioTriggerMapViewChangedOptions
     * @listens MapView#RadioTriggerMapViewChangedCenter
     * @listens GFI#RadioTriggerGFIIsVisible
     * @listens Print#RadioTriggerPrintCreatePrintJob
     */
    initialize: function () {
        var channel = Radio.channel("Print");

        this.superInitialize();
        /**
         * @event Print#RadioTriggerPrintChangeIsAvtive
         * @description sets initial values and activates / deactivates the print mask when the print modul is activated or deactivated
         * @event Print#RadioTriggerPrintChangeSpecification
         * @description triggered when the specifications for the ajax request change
         */
        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (model.get("layoutList").length === 0) {
                    this.getCapabilities(model, value);
                }
                this.togglePostcomposeListener(model, value);
                this.updatePrintPage();
            },
            "change:specification": this.getPDFURL
        });

        /**
         * @event MapView#RadioTriggerMapViewChangedOptions
         * @event MapView#RadioTriggerMapViewChangedCenter
         * @description process new zomm level or map center when they change
         */
        this.listenTo(Radio.channel("MapView"), {
            "changedOptions": function () {
                this.setIsScaleSelectedManually(false);
                this.setScaleByMapView();
            },
            "changedCenter": this.setCenter
        });

        /**
         * @event GFI#RadioTriggerGFIIsVisible
         * @description triggered when the GFI visibility changed
         */
        this.listenTo(Radio.channel("GFI"), {
            "isVisible": function (isGfiActive) {
                if (!isGfiActive) {
                    this.setIsGfiSelected(false);
                }
                this.setIsGfiActive(isGfiActive);
            }
        });

        /**
         * @event Print#RadioTriggerPrintCreatePrintJob
         * @description creates a Print Job when triggered
         */
        channel.on({
            "createPrintJob": this.createPrintJob
        }, this);
    },

    /**
     * Gets the capabilities for a specific print configuration
     * @returns {void}
     */
    getCapabilities: function () {
        /**
         * @event RestReader#RadioRequestRestReaderGetServiceByIdWithPrintID
         * @description gets the service via printID
         * @param {String} printID - Service Id to be send with the event
         * @returns {*} - Service get with the service id
         */
        var resp = Radio.request("RestReader", "getServiceById", this.get("printID")),
            url = resp && resp.get("url") ? resp.get("url") : null,
            printurl;

        if (url) {
            if (this.get("configYAML")) {
                printurl = url + this.get("configYAML");
            }
            else {
                printurl = url;
            }
            this.set("printurl", printurl);
            if (this.get("currentLayer") === undefined) {
                $.ajax({
                    // url: this.get("proxyURL") + "?url=" + printurl + "/info.json",
                    url: printurl + "/info.json",
                    type: "GET",
                    data: "",
                    context: this,
                    success: this.updateParameter
                });
            }
        }
    },

    /**
     * Parses all capabilites
     * @param {*} response - response from print service
     * @return {String} - shows if the function succeeds or fails
     */
    updateParameter: function (response) {
        var result = "success",
            isError = true;

        if (!_.isUndefined(response) && !_.isNull(response) &&
                response.layouts && response.scales && response.outputFormats &&
                response.layouts.length > 0 && response.scales.length > 0 && response.outputFormats.length > 0) {
            this.set("response", response);
            this.setLayoutList(response.layouts);
            this.setCurrentLayout(response.layouts[0]);
            this.setScaleList(response.scales);
            this.setFormatList(response.outputFormats);
            /**
             * @event MapView#RadioRequestMapViewGetOptions
             * @description - gets the current scale from the map
             * @returns {*} - the current scale of the map
             */
            this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
            this.setIsGfiAvailable(!_.isUndefined(this.getAttributeInLayoutByName("gfi")));
            this.setIsLegendAvailable(!_.isUndefined(this.getAttributeInLayoutByName("legend")));
            this.setIsScaleAvailable(!_.isUndefined(this.getAttributeInLayoutByName("scale")));
            this.setIsMetaDataAvailable(!_.isUndefined(this.getAttributeInLayoutByName("metadata")));
            this.togglePostcomposeListener(this, true);
            isError = false;
        }

        if (isError === true) {
            /**
             * @event Alert#RadioTriggerAlertalert
             * @description creates an alert with error message
             */
            Radio.trigger("Alert", "alert", {
                text: "Der response vom Druckdienst ist fehlerhaft",
                kategorie: "alert-warning"
            });

            result = "Error";
        }
        return result;
    },

    /**
     * Print! Is called from View by clicking the print button
     * @returns {void}
     */
    print: function () {
        /**
         * @event Draw#RadioRequestDrawGetLayer
         * @description gets the layer from the Draw modul
         * @returns {*} - layer from the Draw modul
         */
        var drawLayer = Radio.request("Draw", "getLayer");

        this.set("layerToPrint", []);
        /**
         * @event ModelList#RadioRequestModelListGetModelsByAttributesWithisVisibleInMapAndTyp
         * @description gets the layer form the Modellist that is visible in map and is from typ WMS
         * @returns {*} - layer
         * @param {Boolean} isVisibleInMap - Flag if the layer is visible in the map
         * @param {String} typ - typ of the layer
         */
        this.setWMSLayerToPrint(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WMS"}));
        /**
         * @event ModelList#RadioRequestModelListGetModelsByAttributesWithisVisibleInMapAndTyp
         * @description gets the layer form the Modellist that is visible in map and is from typ GROUP
         * @returns {*} - layer
         * @param {Boolean} isVisibleInMap - Flag if the layer is visible in the map
         * @param {String} typ - typ of the layer
         */
        this.setGROUPLayerToPrint(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "GROUP"}));

        if (drawLayer !== undefined && drawLayer.getSource().getFeatures().length > 0) {
            this.setLayer(drawLayer);
        }
        this.getGfiForPrint();
    },

    /**
     * Returns the layout for the given layout name
     * @param {object[]} layoutList - available layouts of the specified print configuration
     * @param {string} layoutName - name for the layout to be found
     * @return {object} layout
     */
    getLayoutByName: function (layoutList, layoutName) {
        return _.find(layoutList, function (layout) {
            return layout.name === layoutName;
        });
    },

    /**
     * Gets the scales that are available for printing
     * @return {Array} - All available Scales of Print service
     */
    getPrintMapScales: function () {
        return this.get("scaleList");
    },

    /**
     * If the tool is activated and there is a layout,
     * a callback function is registered to the postcompose event of the map
     * @param {Backbone.Model} model - this
     * @param {boolean} value - is this tool activated or not
     * @returns {void}
     */
    togglePostcomposeListener: function (model, value) {
        if (value && model.get("layoutList").length !== 0) {
            /**
             * @event Map#RadioRequestMapRegisterListenerWithPostcompose
             * @description register a postcomposeListener
             * @returns {*} - eventListener Postcompose
             * @param {String} postcompose
             */
            this.setEventListener(Radio.request("Map", "registerListener", "postcompose", this.createPrintMask.bind(this)));
        }
        else {
            /**
             * @event Map#RadioTriggerMapUnregisterListenerWithEventListener
             * @description unregister the listener in the eventListener holder from the map
             * @param {String} - eventlistener
             */
            Radio.trigger("Map", "unregisterListener", this.get("eventListener"));
        }
        /**
         * @event Map#RadioTriggerMapRender
         * @description renders the map
         */
        Radio.trigger("Map", "render");
    },

    /**
     * Draws the print page rectangle onto the canvas
     * @param {ol.render.Event} evt - postcompose
     * @returns {void}
     */
    createPrintMask: function (evt) {
        var frameState = evt.frameState,
            context = evt.context,
            scale;

        // scale was selected by the user over the view
        if (this.get("isScaleSelectedManually")) {
            scale = this.get("currentScale");
        }
        else {
            scale = this.getOptimalScale(frameState.size, frameState.viewState.resolution, this.getPrintMapSize(), this.getPrintMapScales());
            this.setCurrentScale(scale);
        }
        this.drawMask(frameState.size, context);
        this.drawPrintPage(frameState.size, frameState.viewState.resolution, this.getPrintMapSize(), scale, context);
        context.fillStyle = "rgba(0, 5, 25, 0.55)";
        context.fill();
    },

    /**
     * Draws a mask on the whole map
     * @param {ol.Size} mapSize - size of the map in px
     * @param {CanvasRenderingContext2D} context - context of the postcompose event
     * @returns {void}
     */
    drawMask: function (mapSize, context) {
        var mapWidth = mapSize[0] * DEVICE_PIXEL_RATIO,
            mapHeight = mapSize[1] * DEVICE_PIXEL_RATIO;

        context.beginPath();
        // Outside polygon, must be clockwise
        context.moveTo(0, 0);
        context.lineTo(mapWidth, 0);
        context.lineTo(mapWidth, mapHeight);
        context.lineTo(0, mapHeight);
        context.lineTo(0, 0);
        context.closePath();
    },

    /**
     * Draws the print page
     * @param {ol.Size} mapSize - size of the map in px
     * @param {number} resolution - resolution of the map in m/px
     * @param {number} printMapSize - size of the map on the report in dots
     * @param {number} scale - the optimal print scale
     * @param {CanvasRenderingContext2D} context - context of the postcompose event
     * @returns {void}
     */
    drawPrintPage: function (mapSize, resolution, printMapSize, scale, context) {
        var center = [mapSize[0] * DEVICE_PIXEL_RATIO / 2, mapSize[1] * DEVICE_PIXEL_RATIO / 2],
            boundWidth = printMapSize[0] / this.get("DOTS_PER_INCH") / this.get("INCHES_PER_METER") * scale / resolution * DEVICE_PIXEL_RATIO,
            boundHeight = printMapSize[1] / this.get("DOTS_PER_INCH") / this.get("INCHES_PER_METER") * scale / resolution * DEVICE_PIXEL_RATIO,
            minx = center[0] - (boundWidth / 2),
            miny = center[1] - (boundHeight / 2),
            maxx = center[0] + (boundWidth / 2),
            maxy = center[1] + (boundHeight / 2);

        // Inner polygon,must be counter-clockwise
        context.moveTo(minx, miny);
        context.lineTo(minx, maxy);
        context.lineTo(maxx, maxy);
        context.lineTo(maxx, miny);
        context.lineTo(minx, miny);
        context.closePath();
    },

    /**
     * Gets the optimal print scale for a map
     * @param {ol.Size} mapSize - size of the map in px
     * @param {number} resolution - resolution of the map in m/px
     * @param {ol.Size} printMapSize - size of the map on the report in dots
     * @param {object[]} scaleList - supported print scales, sorted in ascending order
     * @return {number | String} the optimal scale or an Error String
     */
    getOptimalScale: function (mapSize, resolution, printMapSize, scaleList) {
        var mapWidth,
            mapHeight,
            scaleWidth,
            scaleHeight,
            scale,
            optimalScale,
            undefVal = mapSize === undefined || resolution === undefined || printMapSize === undefined || scaleList === undefined,
            nullVal = mapSize === null || resolution === null || printMapSize === null || scaleList === null;

        if (undefVal || nullVal) {
            return "Error";
        }

        mapWidth = mapSize[0] * resolution;
        mapHeight = mapSize[1] * resolution;
        scaleWidth = mapWidth * this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH") / printMapSize[0];
        scaleHeight = mapHeight * this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH") / printMapSize[1];
        scale = Math.min(scaleWidth, scaleHeight);
        optimalScale = scaleList[0];

        if (isNaN(mapWidth) || isNaN(mapHeight) || isNaN(scaleWidth) || isNaN(scaleHeight) || scaleList.length === 0) {
            return "Error";
        }

        scaleList.forEach(function (printMapScale) {
            if (scale > printMapScale) {
                optimalScale = printMapScale;
            }
        });
        return optimalScale;
    },

    /**
     * Sets scale for print with the zoom of the map.
     * @returns {void}
     */
    setScaleByMapView: function () {
        /**
         * @event MapView#RadioRequestMapViewGetOptions
         * @description gets the current scale from the map
         * @returns {*} - current scale from the map
         */
        var newScale = _.find(this.get("scaleList"), function (scale) {
            return parseInt(scale, 10) === Radio.request("MapView", "getOptions").scale;
        });

        this.set("scale", newScale);
    },

    /**
     * Sets center coordinate.
     * @param {array} value - coordinates of the map center
     * @returns {void}
     */
    setCenter: function (value) {
        if (Array.isArray(value) && typeof value[0] === "number") {
            this.set("center", value);
        }
        else {
            /**
             * @event Alert#RadioTriggerAlertalert
             * @description creates an alert with error message
             */
            Radio.trigger("Alert", "alert", {
                text: "Error! Der übergebene Wert ist ist entweder kein Array oder die Werte im Array sind nicht vom Typ Number",
                kategorie: "alert-warning"
            });
        }
    },

    /**
     * Updates the Print Page
     * @returns {void}
     */
    updatePrintPage: function () {
        if (this.has("scale") && this.has("currentLayout")) {
            if (this.get("isActive")) {
                if (_.isEmpty(this.get("precomposeListener"))) {
                    /**
                     * @event Map#RadioRequestMapRegisterListenerWithPrecompose
                     * @description register a precomposeListener
                     * @param {String} precompose
                     * @returns {*} - precomposeListener
                     */
                    this.setPrecomposeListener(Radio.request("Map", "registerListener", "precompose", this.handlePreCompose.bind(this)));
                }
                if (_.isEmpty(this.get("postcomposeListener"))) {
                    /**
                     * @event Map#RadioRequestMapRegisterListenerWithPostcompose
                     * @description register a postcomposeListener
                     * @param {String} postcompose
                     * @returns {*} - postcomposeListener
                     */
                    this.setPostcomposeListener(Radio.request("Map", "registerListener", "postcompose", this.handlePostCompose.bind(this)));
                }
            }
            else {
                /**
                 * @event Map#RadioTriggerMapUnregisterListenerWithPrecomposeListener
                 * @description unregister the precomposeListener from the map
                 * @param {*} - precomposeListener
                 * @event Map#RadioTriggerMapUnregisterListenerWithPostcomposeListener
                 * @description unregister the postcomposeListener from the map
                 * @param {*} - postcomposeListener
                 */
                Radio.trigger("Map", "unregisterListener", this.get("precomposeListener"));
                Radio.trigger("Map", "unregisterListener", this.get("postcomposeListener"));
            }
            /**
             * @event Map#RadioTriggerMapRender
             * @description renders the map
             */
            Radio.trigger("Map", "render");
        }
    },

    /**
     * Manage printing of group layers
     * @param {*} layers - group layers
     * @returns {void}
     */
    setGROUPLayerToPrint: function (layers) {
        var sortedLayers;

        sortedLayers = _.sortBy(layers, function (layer) {
            return layer.get("selectionIDX");
        });
        _.each(sortedLayers, function (groupLayer) {
            var layerList = groupLayer.get("layerSource");

            _.each(layerList, function (layer) {
                var params = {},
                    style = [],
                    numberOfLayer,
                    i,
                    defaultStyle;

                if (layer.get("typ") === "WMS") {
                    if (layer.has("styles")) {
                        style.push(layer.get("styles"));
                    }
                    // For each given layer a style must be declared.
                    // If a style is given with a blank,
                    // the Default-Style of the layer is used. Example for 3 layers: countries,,cities
                    else {
                        numberOfLayer = layer.get("layers").split(",").length;
                        defaultStyle = "";

                        for (i = 1; i < numberOfLayer; i++) {
                            defaultStyle += ",";
                        }
                        style.push(defaultStyle);
                    }

                    this.push("layerToPrint", {
                        type: layer.get("typ"),
                        layers: layer.get("layers").split(),
                        baseURL: layer.get("url"),
                        format: "image/png",
                        opacity: (100 - layer.get("transparency")) / 100,
                        customParams: params,
                        styles: style
                    });
                }
            }, this);
        }, this);
    },

    /**
     * Manage printing of WMS layers
     * @param {*} layers - WMS layers
     * @returns {void}
     */
    setWMSLayerToPrint: function (layers) {
        var sortedLayers;

        sortedLayers = _.sortBy(layers, function (layer) {
            return layer.get("selectionIDX");
        });
        _.each(sortedLayers, function (layer) {
            // only important for treeFilter
            var params = {},
                style = [],
                layerURL = layer.get("url"),
                numberOfLayer,
                i,
                defaultStyle;

            if (layer.has("SLDBody")) {
                params.SLD_BODY = layer.get("SLDBody");
            }
            if (layer.get("id") === "2298") {
                style.push("strassenbaumkataster_grau");
            }
            if (layer.has("styles")) {
                style.push(layer.get("styles"));
            }
            // A style is necessary for each stated layer.
            // If a style is given with a blank,
            // the Default-Style of the layer is used. Example for 3 layers: countries,,cities
            else {
                numberOfLayer = layer.get("layers").split(",").length;
                defaultStyle = "";

                for (i = 1; i < numberOfLayer; i++) {
                    defaultStyle += ",";
                }
                style.push(defaultStyle);
            }
            // necessary to print Web-Atlas
            if (layer.get("url").indexOf("gdi_mrh_themen") >= 0) {
                layerURL = layer.get("url").replace("gdi_mrh_themen", "gdi_mrh_themen_print");
            }
            else if (layer.get("url").indexOf("gdi_mrh") >= 0) {
                layerURL = layer.get("url").replace("gdi_mrh", "gdi_mrh_print");
            }
            else if (layer.get("url").indexOf("geoportal.metropolregion.hamburg.de") >= 0 ||
                    layer.get("url").indexOf("geoportaltest.metropolregion.hamburg.de") >= 0) {
                layerURL = layer.get("url") + "_print";
            }
            this.push("layerToPrint", {
                type: layer.get("typ"),
                layers: layer.get("layers").split(),
                baseURL: layerURL,
                format: "image/png",
                opacity: (100 - layer.get("transparency")) / 100,
                customParams: params,
                styles: style
            });
        }, this);
    },

    /**
     * Sets layer properties
     * @param {*} layer - layer
     * @returns {void}
     */
    setLayer: function (layer) {
        var features = [],
            featureStyles = {},
            printStyleObj = {},
            layerId = layer.get("id"),
            layerModel,
            isClustered,
            styleModel;

        if (!_.isUndefined(layer)) {
            // get styleModel if layerId is defined.
            // layer id is not defined for portal-internal layer like animationLayer and import_draw_layer
            // then the style is located directly at the feature, see line 312
            if (!_.isUndefined(layerId) || !_.isUndefined(layer.id)) {
                /**
                 * @event ModelList#RadioRequestModelListGetModelsByAttributesWithId
                 * @description gets the layer form the Modellist that has the passed id
                 * @param {String} - layerId
                 * @returns {*} - layer
                 * @event StyleList#RadioRequestStyleListReturnModelByIdWithStyleId
                 * @description gets the style from the Stylelist that has the passed styleId
                 * @param {*} - styleId
                 * @returns {*} - style
                 */
                layerModel = Radio.request("ModelList", "getModelByAttributes", {id: layerId});
                isClustered = !_.isUndefined(layerModel.get("clusterDistance"));
                styleModel = Radio.request("StyleList", "returnModelById", layerModel.get("styleId"));
            }
            // All features that have a circle-geometry
            _.each(layer.getSource().getFeatures(), function (feature) {
                if (feature.getGeometry() instanceof Circle) {
                    // creates a regular polygon from a circle with 32(default) sides
                    feature.setGeometry(Polygon.fromCircle(feature.getGeometry()));
                }
            });

            _.each(layer.getSource().getFeatures(), function (feature, index) {
                var type = feature.getGeometry().getType(),
                    styles = !_.isUndefined(feature.getStyleFunction()) ? feature.getStyleFunction().call(feature) : styleModel.createStyle(feature, isClustered),
                    style = _.isArray(styles) ? styles[0] : styles,
                    coordinates = feature.getGeometry().getCoordinates();

                features.push({
                    type: "Feature",
                    properties: {
                        _style: index
                    },
                    geometry: {
                        coordinates: coordinates,
                        type: type
                    }
                });

                // Points
                if (type === "Point" || type === "MultiPoint") {
                    printStyleObj = this.createPointStyleForPrint(style);
                    featureStyles[index] = printStyleObj;
                }
                // Polygons or Linestrings
                else {
                    featureStyles[index] = {
                        fillColor: this.getColor(style.getFill().getColor()).color,
                        fillOpacity: this.getColor(style.getFill().getColor()).opacity,
                        strokeColor: this.getColor(style.getStroke().getColor()).color,
                        strokeWidth: style.getStroke().getWidth()
                    };
                }
            }, this);
            this.push("layerToPrint", {
                type: "Vector",
                styles: featureStyles,
                geoJson: {
                    type: "FeatureCollection",
                    features: features
                }
            });
        }
    },

    /**
     * Creates the Style of a Point for printing
     * @param {*} style - style configurations
     * @return {Object} - Point with styles
     */
    createPointStyleForPrint: function (style) {
        var pointStyleObject = {},
            imgPath = this.createImagePath(),
            imgName = style.getImage() instanceof Icon ? style.getImage().getSrc() : undefined;

        // Points without text
        if (_.isNull(style.getText()) || _.isUndefined(style.getText())) {
            // style image is an Icon
            if (!_.isUndefined(imgName)) {
                // get imagename from src path
                imgName = imgName.match(/(?:[^/]+)$/g)[0];
                imgPath += imgName;
                imgPath = encodeURI(imgPath);
                pointStyleObject = {
                    externalGraphic: imgPath,
                    graphicWidth: _.isArray(style.getImage().getSize()) ? style.getImage().getSize()[0] * style.getImage().getScale() : 20,
                    graphicHeight: _.isArray(style.getImage().getSize()) ? style.getImage().getSize()[1] * style.getImage().getScale() : 20,
                    graphicXOffset: !_.isNull(style.getImage().getAnchor()) ? -style.getImage().getAnchor()[0] : 0,
                    graphicYOffset: !_.isNull(style.getImage().getAnchor()) ? -style.getImage().getAnchor()[1] : 0
                };
            }
            // style is an Circle or Point without Icon
            else {
                pointStyleObject = {
                    fillColor: this.getColor(style.getImage().getFill().getColor()).color,
                    fillOpacity: this.getColor(style.getImage().getFill().getColor()).opacity,
                    pointRadius: style.getImage().getRadius(),
                    strokeColor: this.getColor(style.getImage().getFill().getColor()).color,
                    strokeOpacity: this.getColor(style.getImage().getFill().getColor()).opacity
                };
            }
        }
        // Texts
        else {
            pointStyleObject = {
                label: style.getText().getText(),
                fontColor: this.getColor(style.getText().getFill().getColor()).color
            };
        }
        return pointStyleObject;
    },

    /**
     * Gets the path of an image
     * @return {String} - path of the image
     */
    createImagePath: function () {
        var imgPath = window.location.origin + "/lgv-config/img/";

        // for local IDE take path to
        if (imgPath.indexOf("localhost") !== -1) {
            imgPath = "http://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/";
        }
        return imgPath;
    },

    /**
     * GFI Managing
     * @param {*} gfiPosition - Position of GFI
     * @returns {void}
     */
    setSpecification: function (gfiPosition) {
        /**
         * @event Map#RadioRequestMapGetLayers
         * @description gets all layers from the map
         * @returns {List} - List of Layers
         */
        var layers = Radio.request("Map", "getLayers").getArray(),
            animationLayer = _.filter(layers, function (layer) {
                return layer.get("name") === "animationLayer";
            }),
            wfsLayer = _.filter(layers, function (layer) {
                return layer.get("typ") === "WFS" && layer.get("visible") === true && layer.getSource().getFeatures().length > 0;
            }),
            specification;

        if (animationLayer.length > 0) {
            this.setLayer(animationLayer[0]);
        }
        _.each(wfsLayer, function (layer) {
            this.setLayer(layer);
        }, this);
        /**
         * @event MapView#RadioRequestMapViewGetProjection
         * @description get the coordinateSystem of the map
         * @returns {*} coordinateSystem code of the map
         * @event MapView#RadioRequestMapViewGetCenter
         * @description gets the center of the map
         * @returns {Array} - center coordinates of the map
         */
        specification = {
            layout: this.get("currentLayout").name,
            srs: Radio.request("MapView", "getProjection").getCode(),
            units: "m",
            outputFilename: this.get("outputFilename"),
            outputFormat: this.get("currentFormat"),
            layers: this.get("layerToPrint"),
            pages: [
                {
                    center: Radio.request("MapView", "getCenter"),
                    scale: this.get("currentScale"),
                    scaleText: "1 : " + this.get("currentScale"),
                    geodetic: true,
                    dpi: "96",
                    mapTitle: this.get("title")
                }
            ]
        };

        if (gfiPosition !== null) {
            _.each(_.flatten(this.get("gfiParams")), function (element, index) {
                specification.pages[0]["attr_" + index] = element;
            }, this);
            specification.pages[0].layerName = this.get("gfiTitle");
        }
        this.set("specification", specification);
    },

    /**
     * Checks, if a circle should be drawn at GFI-Position and, if necessary, adds a layer.
     * @param {number[]} gfiPosition - gfi Position
     * @returns {void}
     */
    setGFIPos: function (gfiPosition) {
        if (gfiPosition !== null) {
            gfiPosition[0] = gfiPosition[0] + 0.25; // improvment of Point location in Print
            this.push("layerToPrint", {
                type: "Vector",
                styleProperty: "styleId",
                styles: {
                    0: this.get("gfiMarker").outerCircle,
                    1: this.get("gfiMarker").point
                },
                geoJson: {
                    type: "FeatureCollection",
                    features: [
                        {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: gfiPosition
                            },
                            properties: {
                                styleId: 0
                            }
                        },
                        {
                            type: "Feature",
                            geometry: {
                                type: "Point",
                                coordinates: gfiPosition
                            },
                            properties: {
                                styleId: 1
                            }
                        }
                    ]
                }
            });
        }
        this.setSpecification(gfiPosition);
    },

    /**
    * Sets createURL in dependence of GFI
    * @returns {void}
    */
    getGfiForPrint: function () {
        /**
         * @event GFI#RadioRequestGFIGetIsVisible
         * @description requests if the GFI is visible
         * @returns {Boolean} - flag if GFI is visible
         * @event GFI#RadioRequestGFIGetGfiForPrint
         * @description gets the gfi for the print
         * @returns {*} - gfi for print
         */
        var gfis = Radio.request("GFI", "getIsVisible") === true ? Radio.request("GFI", "getGfiForPrint") : null,
            gfiParams = _.isArray(gfis) === true ? _.pairs(gfis[0]) : null, // Parameter
            gfiTitle = _.isArray(gfis) === true ? gfis[1] : "", // Layertitle
            gfiPosition = _.isArray(gfis) === true ? gfis[2] : null, // Coordinates of GFI
            printGFI = this.get("gfi"), // should be printed according to config parameter?
            printurl = this.get("printurl"); // URL of print service

        this.set("gfiParams", gfiParams);
        this.set("gfiTitle", gfiTitle);
        // If GFIPos exists and number of gfiParameter is != 0
        if (!_.isNull(gfiPosition) && printGFI === true && gfiParams && gfiParams.length > 0) {
            this.set("createURL", printurl + "_gfi_" + this.get("gfiParams").length.toString() + "/create.json");
        }
        else {
            this.set("createURL", printurl + "/create.json");
        }

        if (gfiPosition !== undefined && gfiPosition !== null) {
            this.setGFIPos(gfiPosition);
        }
    },

    /**
     * @desc Conducts an HTTP-Post-Request.
     * @returns {void}
     */
    getPDFURL: function () {
        $.ajax({
            // url: this.get("proxyURL") + "?url=" + this.get("createURL"),
            url: this.get("createURL"),

            type: "POST",
            context: this,
            async: false,
            data: JSON.stringify(this.get("specification")),
            success: this.openPDF,
            error: function (error) {
                /**
                 * @event Alert#RadioTriggerAlertalert
                 * @description creates an alert with error message
                 */
                Radio.trigger("Alert", "alert", {
                    text: "Druck fehlgeschlagen: " + error.statusText,
                    kategorie: "alert-warning"
                });
            },
            complete: function () {
                /**
                 * @event Util#RadioTriggerUtilHideLoader
                 * @description hides the loader
                 */
                Radio.trigger("Util", "hideLoader");
            },
            beforeSend: function () {
                /**
                 * @event Util#RadioTriggerUtilShowLoader
                 * @description showes the loader
                 */
                Radio.trigger("Util", "showLoader");
            }
        });
    },

    /**
     * @desc Opens the generated PDF in the browser.
     * @param {Object} data - Answer from print service. Contains the URL for the generated PDF.
     * @returns {void}
     */
    openPDF: function (data) {
        window.open(data.getURL);
    },

    /**
     * @desc Helper method to set an attribute of type array.
     * @param {String} attribute - The attribute to set.
     * @param {whatever} value - The value of the attribute.
     * @returns {void}
     */
    push: function (attribute, value) {
        var tempArray = _.clone(this.get(attribute));

        tempArray.push(value);
        this.set(attribute, _.flatten(tempArray));
    },

    /**
     * Proofs if it is a rgb(a) or a hexadecimel String.
     * If it is a rgb(a) string, it will be converted to an hexadecimal string.
     * If available, the opacity (default = 1) is overwritten.
     * @param {Array} value - Color
     * @return {String} - hexadecimal String and opacity or an Error String
     */
    getColor: function (value) {
        var color = value,
            opacity = 1;

        if (color !== null && color !== undefined) {

            // color comes as array--> parse to String
            color = color.toString();

            if (color.search("#") === -1) {
                color = color.split(",");
                if (color.length === 4) {
                    opacity = parseFloat(color[3], 10);
                }
                color = this.rgbToHex(parseInt(color[0], 10), parseInt(color[1], 10), parseInt(color[2], 10));
                if (color === undefined) {
                    return "Error";
                }
                return {
                    "color": color,
                    "opacity": opacity
                };
            }
            return {
                "color": color,
                "opacity": opacity
            };
        }
        return "Error";
    },

    /**
     * returns the assembled hexadecimal string.
     * @param {Int} red - rgb color code
     * @param {Int} green - rgb color code
     * @param {Int} blue - rgb color code
     * @return {String} - hex color code
     */
    rgbToHex: function (red, green, blue) {
        if (this.componentToHex(red) === undefined || this.componentToHex(green) === undefined || this.componentToHex(blue) === undefined) {
            return undefined;
        }

        return "#" + this.componentToHex(red) + this.componentToHex(green) + this.componentToHex(blue);
    },

    /**
     * Converts an integer (color) to hexadecimal string and return it.
     * @param {Int} color - rgb color code
     * @return {String} - hex color code
     */
    componentToHex: function (color) {
        var hex;

        if (isNaN(color)) {
            return undefined;
        }
        hex = color.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
    },

    /**
     * Saves event contex of Precompose
     * @param {*} evt - event
     * @returns {void}
     */
    handlePreCompose: function (evt) {
        var ctx = evt.context;

        ctx.save();
    },

    /**
     * create print bounding box
     * @param {*} evt - event
     * @returns {void}
     */
    handlePostCompose: function (evt) {
        var ctx = evt.context,
            /**
            * @event Map#RadioRequestMapGetSize
            * @description requests the size of the map
            * @returns {Array} - Array with the size of the map
            */
            size = Radio.request("Map", "getSize"),
            height = size[1] * DEVICE_PIXEL_RATIO,
            width = size[0] * DEVICE_PIXEL_RATIO,
            printPageRectangle = this.calculatePageBoundsPixels(size),
            minx = printPageRectangle[0],
            miny = printPageRectangle[1],
            maxx = printPageRectangle[2],
            maxy = printPageRectangle[3];

        ctx.beginPath();
        // Outside polygon, must be clockwise
        ctx.moveTo(0, 0);
        ctx.lineTo(width, 0);
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.lineTo(0, 0);
        ctx.closePath();
        // Inner polygon,must be counter-clockwise
        ctx.moveTo(minx, miny);
        ctx.lineTo(minx, maxy);
        ctx.lineTo(maxx, maxy);
        ctx.lineTo(maxx, miny);
        ctx.lineTo(minx, miny);
        ctx.closePath();
        ctx.fillStyle = "rgba(0, 5, 25, 0.55)";
        ctx.fill();
        ctx.restore();
    },

    /**
     * calculate the pixels of page bounds
     * @param {Array} mapSize - size of the map
     * @return {Array | String} - page bounds in pixels or an Error String
     */
    calculatePageBoundsPixels: function (mapSize) {
        var s = this.get("scale"),
            width = this.get("currentLayout"),
            height = this.get("currentLayout"),
            /**
             * @event MapView#RadioRequestMapViewGetOptions
             * @description gets all MapView Options
             * @returns {Object} - MapView options
             */
            resolution = Radio.request("MapView", "getOptions"),
            w, h, center, minx, miny, maxx, maxy;

        if (_.isUndefined(s) || _.isUndefined(width) || _.isUndefined(height) || _.isUndefined(resolution) || _.isUndefined(mapSize) || _.isNull(mapSize)) {
            return "Error";
        }

        width = width.map.width;
        height = height.map.height;
        resolution = resolution.resolution;
        w = width / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * s / resolution * DEVICE_PIXEL_RATIO;
        h = height / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * s / resolution * DEVICE_PIXEL_RATIO;
        center = [mapSize[0] * DEVICE_PIXEL_RATIO / 2,
            mapSize[1] * DEVICE_PIXEL_RATIO / 2];

        if (_.isNaN(w) || _.isNaN(h) || _.isNaN(center[0]) || _.isNaN(center[1])) {
            return "Error";
        }

        minx = center[0] - (w / 2);
        miny = center[1] - (h / 2);
        maxx = center[0] + (w / 2);
        maxy = center[1] + (h / 2);

        return [minx, miny, maxx, maxy];
    },

    /**
     * gets the optimal map resolution for a print scale and a map size
     * @param {number} scale - print scale for the report
     * @param {number[]} mapSize - the current map size
     * @param {number[]} printMapSize - size of the map on the report
     * @return {number | String} - the optimal resolution or an Error String
     */
    getOptimalResolution: function (scale, mapSize, printMapSize) {
        var dotsPerMeter = this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH"),
            resolutionX,
            resolutiony;

        if (scale === undefined || mapSize === undefined || printMapSize === undefined || scale === null || mapSize === null || printMapSize === null) {
            return "Error";
        }

        resolutionX = printMapSize[0] * scale / (dotsPerMeter * mapSize[0]);
        resolutiony = printMapSize[1] * scale / (dotsPerMeter * mapSize[1]);

        if (isNaN(resolutionX) && isNaN(resolutiony)) {
            return "Error";
        }
        return Math.max(resolutionX, resolutiony);

    },

    /**
     * returns the size of the map on the report
     * @return {number[]} - width and height
     */
    getPrintMapSize: function () {
        var layoutMapInfo = this.getAttributeInLayoutByName("map");

        return [layoutMapInfo.width, layoutMapInfo.height];
    },

    /**
     * returns a capabilities attribute object of the current layout, corresponding to the given name
     * @param {string} name - name of the attribute to get
     * @return {object|undefined} - corresponding attribute or null
     */
    getAttributeInLayoutByName: function (name) {
        return this.get("currentLayout")[name];
    },

    /**
     * Sets a precompose Listener for the model
     * @param {*} value - eventlistener on Map for precompose
     * @returns {void}
     */
    setPrecomposeListener: function (value) {
        this.set("precomposeListener", value);
    },

    /**
     * Sets a  postcompose Listener for the model
     * @param {*} value - eventlistener on Map for postcompose
     * @returns {void}
     */
    setPostcomposeListener: function (value) {
        this.set("postcomposeListener", value);
    },

    /**
     * Sets a value for metadata availability for the model
     * @param {boolean} value - true if the current layout supports meta data
     * @returns {void}
     */
    setIsMetaDataAvailable: function (value) {
        if (_.isBoolean(value)) {
            this.set("isMetaDataAvailable", value);
        }
        else {
            this.set("isMetaDataAvailable", false);
        }
    },

    /**
     * Sets the title for the print page
     * @param {String} value  - Title
     * @returns {void}
     */
    setTitle: function (value) {
        if (value !== undefined && value !== null) {
            this.set("title", value);
        }
        else {
            /**
             * @event Alert#RadioTriggerAlertalert
             * @description creates an alert with error message
             */
            Radio.trigger("Alert", "alert", {
                text: "Bitte einen Titel eingeben",
                kategorie: "alert-warning"
            });
        }
    },

    /**
     * Sets a value for the current Layout
     * @param {object[]} value - current print layout
     * @returns {void}
     */
    setCurrentLayout: function (value) {
        if (value !== undefined) {
            this.set("currentLayout", value);
        }
        else {
            /**
             * @event Alert#RadioTriggerAlertalert
             * @description creates an alert with error message
             */
            Radio.trigger("Alert", "alert", {
                text: "Error! Keine Layouts vom Druckdienst definiert",
                kategorie: "alert-warning"
            });
        }
    },

    /**
     * Sets a value for the current format
     * @param {string} value - current print format
     * @returns {void}
     */
    setCurrentFormat: function (value) {
        if (value !== undefined) {
            this.set("currentFormat", value);
        }
        else {
            /**
             * @event Alert#RadioTriggerAlertalert
             * @description creates an alert with error message
             */
            Radio.trigger("Alert", "alert", {
                text: "Error! Keine Formats vom Druckdienst definiert",
                kategorie: "alert-warning"
            });
        }
    },

    /**
     * Sets a value for the availability of gfi
     * @param {boolean} value - true if mapfish can print gfi
     * @returns {void}
     */
    setIsGfiAvailable: function (value) {
        if (_.isBoolean(value)) {
            this.set("isGfiAvailable", value);
        }
        else {
            this.set("isGfiAvailable", false);
        }
    },

    /**
     * Sets a value for the activity of gfi
     * @param {boolean} value - true if gfi is active
     * @returns {void}
     */
    setIsGfiActive: function (value) {
        if (_.isBoolean(value)) {
            this.set("isGfiActive", value);
        }
        else {
            this.set("isGfiActive", false);
        }
    },

    /**
     * Sets a value for gfi select
     * @param {boolean} value - true if gfi is to be printed
     * @returns {void}
     */
    setIsGfiSelected: function (value) {
        if (_.isBoolean(value)) {
            this.set("isGfiSelected", value);
        }
        else {
            this.set("isGfiSelected", false);
        }
    },

    /**
     * Sets a value for the availability of the legend
     * @param {boolean} value - true if mapfish can print legend
     * @returns {void}
     */
    setIsLegendAvailable: function (value) {
        if (_.isBoolean(value)) {
            this.set("isLegendAvailable", value);
        }
        else {
            this.set("isLegendAvailable", false);
        }
    },

    /**
     * Sets a value for the availability of the scale
     * @param {boolean} value - true if mapfish can print scale
     * @returns {void}
     */
    setIsScaleAvailable: function (value) {
        if (_.isBoolean(value)) {
            this.set("isScaleAvailable", value);
        }
        else {
            this.set("isScaleAvailable", false);
        }
    },

    /**
     * Sets a value for the current scale of the map
     * @param {number} value - current print scale
     * @returns {void}
     */
    setCurrentScale: function (value) {
        if (value !== undefined) {
            this.set("currentScale", value.toString());
        }
        else {
            /**
             * @event Alert#RadioTriggerAlertalert
             * @description creates an alert with error message
             */
            Radio.trigger("Alert", "alert", {
                text: "Keine Scales vom Druckdienst definiert",
                kategorie: "alert-warning"
            });
        }
    },

    /**
     * Sets all layouts available for a print
     * @param {*} layouts - list of layouts from plot service
     * @returns {void}
     */
    setLayoutList: function (layouts) {
        var that = this;

        _.each(layouts, function (layout) {
            that.get("layoutList").push(layout);
        });
    },

    /**
     * Sets all formats available for a print
     * @param {*} formats - list of formats from plot service
     * @returns {void}
     */
    setFormatList: function (formats) {
        var that = this;

        _.each(formats, function (format) {
            that.get("formatList").push(format.name);
        });
    },

    /**
     * Sets all scales available for a print
     * @param {*} scales - list of scales from plot service
     * @returns {void}
     */
    setScaleList: function (scales) {
        var that = this;

        _.each(scales, function (scale) {
            that.get("scaleList").push(scale.value);
        });
    },

    /**
     * Sets a value for manually selected scales
     * @param {boolean} value - true if the scale is selected by the user
     * @returns {void}
     */
    setIsScaleSelectedManually: function (value) {
        if (_.isBoolean(value)) {
            this.set("isScaleSelectedManually", value);
        }
        else {
            this.set("isScaleSelectedManually", false);
        }
    },

    /**
     * Sets an eventlistener
     * @param {*} value - Eventlistener for Map on postcompose
     * @returns {void}
     */
    setEventListener: function (value) {
        this.set("eventListener", value);
    }
});

export default PrintModel;
