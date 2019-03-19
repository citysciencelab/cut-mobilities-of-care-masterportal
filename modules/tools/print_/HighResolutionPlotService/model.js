import Tool from "../../../core/modelList/tool/model";
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
        // is scale selected by the user over the view
        isScaleSelectedManually: false,
        // true if the current layout supports meta data
        isMetaDataAvailable: false,
        // true if the current layout supports scale
        isScaleAvailable: false,
        eventListener: {},
        printID: "99999",
        MM_PER_INCHES: 25.4,
        POINTS_PER_INCH: 72,
        title: "PrintResult",
        outputFilename: "Ausdruck",
        outputFormat: "pdf",
        gfiToPrint: [], //  visible GFIs
        center: [],
        scale: {},
        layerToPrint: [],
        fetched: false, // declares if info.json is already loaded
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
        deactivateGFI: false,
        renderToWindow: true,
        proxyURL: "",
        glyphicon: "glyphicon-print",
        precomposeListener: {},
        postcomposeListener: {},
        DOTS_PER_INCH: 72,
        INCHES_PER_METER: 39.37
    }),

    // Determine the URL to fetch in setStatus with query of ServiceId
    url: function () {
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
            // return this.get("proxyURL") + "?url=" + printurl + "/info.json";
            return printurl + "/info.json";
        }
        return "undefined"; // has to return a string, otherwise runtime error
    },

    initialize: function () {
        var channel = Radio.channel("Print");

        this.superInitialize();
        console.log("Hallo dEE Print");

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (model.get("layoutList").length === 0) {
                    this.getCapabilities(model, value);
                }
                this.togglePostcomposeListener(model, value);
                this.updatePrintPage();
            },
            "change:layout": this.updatePrintPage,
            "change:scale": this.updatePrintPage,
            "change:specification": this.getPDFURL
        });

        this.listenTo(Radio.channel("MapView"), {
            "changedOptions": this.setScaleByMapView,
            "changedCenter": this.setCenter
        });

        this.listenTo(Radio.channel("GFI"), {
            "isVisible": function (isGfiActive) {
                if (!isGfiActive) {
                    this.setIsGfiSelected(false);
                }
                this.setIsGfiActive(isGfiActive);
            }
        });
        channel.on({
            "createPrintJob": this.createPrintJob
        }, this);
    },

    getCapabilities: function () {
        var resp = Radio.request("RestReader", "getServiceById", this.get("printID")),
            url = resp && resp.get("url") ? resp.get("url") : null;

        this.set("printurl", url);

        if (this.get("currentLayer") === undefined) {
            $.ajax({
                url: url + "/info.json",
                type: "GET",
                data: "",
                context: this,
                success: this.updateParameter
            });
        }
    },
    updateParameter: function (response) {

        this.setLayoutList(response.layouts);
        this.setCurrentLayout(response.layouts[0]);
        this.setScaleList(response.scales);
        this.setFormatList(response.outputFormats);
        this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
        this.setIsGfiAvailable(!_.isUndefined(this.getAttributeInLayoutByName("gfi")));
        this.setIsLegendAvailable(!_.isUndefined(this.getAttributeInLayoutByName("legend")));
        this.setIsScaleAvailable(!_.isUndefined(this.getAttributeInLayoutByName("scale")));
        this.setIsMetaDataAvailable(!_.isUndefined(this.getAttributeInLayoutByName("metadata")));
        this.togglePostcomposeListener(this, true);

    },

    print: function () {
        var drawLayer = Radio.request("Draw", "getLayer");

        this.set("layerToPrint", []);
        this.setWMSLayerToPrint(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "WMS"}));
        this.setGROUPLayerToPrint(Radio.request("ModelList", "getModelsByAttributes", {isVisibleInMap: true, typ: "GROUP"}));

        if (drawLayer !== undefined && drawLayer.getSource().getFeatures().length > 0) {
            this.setLayer(drawLayer);
        }
        this.getGfiForPrint();
    },

    /**
     * returns the layout for the given layout name
     * @param {object[]} layoutList - available layouts of the specified print configuration
     * @param {string} layoutName - name for the layout to be found
     * @returns {object} layout
     */
    getLayoutByName: function (layoutList, layoutName) {
        return _.find(layoutList, function (layout) {
            return layout.name === layoutName;
        });
    },

    getPrintMapScales: function () {
        return this.get("scaleList");
    },

    // Overwrites the title of the print if necessary. Default value can be set via config.js.
    setTitleFromForm: function () {
        if ($("#titleField").val()) {
            this.setTitle($("#titleField").val());
        }
    },

    /**
     * if the tool is activated and there is a layout,
     * a callback function is registered to the postcompose event of the map
     * @param {Backbone.Model} model - this
     * @param {boolean} value - is this tool activated or not
     * @returns {void}
     */
    togglePostcomposeListener: function (model, value) {
        if (value && model.get("layoutList").length !== 0) {
            this.setEventListener(Radio.request("Map", "registerListener", "postcompose", this.createPrintMask.bind(this)));

        }
        else {
            Radio.trigger("Map", "unregisterListener", this.get("eventListener"));
        }
        Radio.trigger("Map", "render");
    },
    /**
     * draws the print page rectangle onto the canvas
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
     * draws a mask on the whole map
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
     * draws the print page
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
     * gets the optimal print scale for a map
     * @param {ol.Size} mapSize - size of the map in px
     * @param {number} resolution - resolution of the map in m/px
     * @param {ol.Size} printMapSize - size of the map on the report in dots
     * @param {object[]} scaleList - supported print scales, sorted in ascending order
     * @returns {number} the optimal scale
     */
    getOptimalScale: function (mapSize, resolution, printMapSize, scaleList) {
        var mapWidth = mapSize[0] * resolution,
            mapHeight = mapSize[1] * resolution,
            scaleWidth = mapWidth * this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH") / printMapSize[0],
            scaleHeight = mapHeight * this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH") / printMapSize[1],
            scale = Math.min(scaleWidth, scaleHeight),
            optimalScale = scaleList[0];

        scaleList.forEach(function (printMapScale) {
            if (scale > printMapScale) {
                optimalScale = printMapScale;
            }
        });

        return optimalScale;
    },

    // Sets format (DinA4/ A3 Hoch-/Querformat) for print.
    setLayout: function (index) {
        this.set("layout", this.get("layouts")[index]);
    },

    // Sets scale for print with the print settings.
    setScale: function (index) {
        var scaleval = this.get("scales")[index].valueInt;

        Radio.trigger("MapView", "setScale", scaleval);
    },

    // Sets scale for print with the zoom of the map.
    setScaleByMapView: function () {
        var newScale = _.find(this.get("scales"), function (scale) {
            return scale.valueInt === Radio.request("MapView", "getOptions").scale;
        });

        this.set("scale", newScale);
    },

    // Sets center coordinate.
    setCenter: function (value) {
        this.set("center", value);
    },

    setStatus: function (bmodel, value) {
        var scaletext;

        if (value && this.get("layouts") === undefined) {
            if (this.get("fetched") === false) {
                this.fetch({
                    cache: false,
                    success: function (model) {
                        model.set("layoutList", model.get("layouts"));
                        _.each(model.get("scales"), function (scale) {
                            scale.valueInt = parseInt(scale.value, 10);
                            scaletext = scale.valueInt.toString();
                            scaletext = scaletext < 10000 ? scaletext : scaletext.substring(0, scaletext.length - 3) + " " + scaletext.substring(scaletext.length - 3);
                            scale.name = "1: " + scaletext;
                        });
                        model.setScaleByMapView();
                        model.set("isCollapsed", false);
                        model.set("fetched", true);
                    },
                    error: function () {
                        Radio.trigger("Alert", "alert", {text: "<strong>Druckkonfiguration konnte nicht geladen werden!</strong> Bitte versuchen Sie es später erneut.", kategorie: "alert-danger"});
                        Radio.trigger("Window", "setIsVisible", false);
                    },
                    complete: function () {
                        Radio.trigger("Util", "hideLoader");
                    },
                    beforeSend: function () {
                        Radio.trigger("Util", "showLoader");
                    }
                });
                this.updatePrintPage();
            }
        }
    },

    updatePrintPage: function () {
        if (this.has("scale") && this.has("layout")) {
            if (this.get("isActive")) {
                if (_.isEmpty(this.get("precomposeListener"))) {
                    this.setPrecomposeListener(Radio.request("Map", "registerListener", "precompose", this.handlePreCompose.bind(this)));
                }
                if (_.isEmpty(this.get("postcomposeListener"))) {
                    this.setPostcomposeListener(Radio.request("Map", "registerListener", "postcompose", this.handlePostCompose.bind(this)));
                }
            }
            else {
                Radio.trigger("Map", "unregisterListener", this.get("precomposeListener"));
                Radio.trigger("Map", "unregisterListener", this.get("postcomposeListener"));
            }
            Radio.trigger("Map", "render");
        }
    },

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
            if (!_.isUndefined(layerId)) {
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
    createImagePath: function () {
        var imgPath = window.location.origin + "/lgv-config/img/";

        // for local IDE take path to
        if (imgPath.indexOf("localhost") !== -1) {
            imgPath = "http://geofos.fhhnet.stadt.hamburg.de/lgv-config/img/";
        }
        return imgPath;
    },

    setSpecification: function (gfiPosition) {
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
     * @param {number[]} gfiPosition -
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
        this.setGFIPos(gfiPosition);
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
                Radio.trigger("Alert", "alert", {
                    text: "Druck fehlgeschlagen: " + error.statusText,
                    kategorie: "alert-warning"
                });
            },
            complete: function () {
                Radio.trigger("Util", "hideLoader");
            },
            beforeSend: function () {
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

    // Proofs if it is a rgb(a) or a hexadecimel String.
    // If it is a rgb(a) string, it will be converted to an hexadecimal string.
    // If available, the opacity(default = 1) is overwritten.
    // returns an hexadecimel String and the opacity.
    getColor: function (value) {
        var color = value,
            opacity = 1;

        // color comes as array--> parse to String
        color = color.toString();

        if (color.search("#") === -1) {
            color = color.split(",");
            if (color.length === 4) {
                opacity = parseFloat(color[3], 10);
            }
            color = this.rgbToHex(parseInt(color[0], 10), parseInt(color[1], 10), parseInt(color[2], 10));

            return {
                "color": color,
                "opacity": opacity
            };
        }

        return {
            "color": color,
            "opacity": opacity
        };

    },

    // returns the assembled hexadecimal string.
    rgbToHex: function (red, green, blue) {
        return "#" + this.componentToHex(red) + this.componentToHex(green) + this.componentToHex(blue);
    },

    // Converts an integer (color) to hexadecimal string and return it.
    componentToHex: function (color) {
        var hex = color.toString(16);

        return hex.length === 1 ? "0" + hex : hex;
    },

    handlePreCompose: function (evt) {
        var ctx = evt.context;

        ctx.save();
    },

    handlePostCompose: function (evt) {
        var ctx = evt.context,
            size = Radio.request("Map", "getSize"),
            height = size[1] * DEVICE_PIXEL_RATIO,
            width = size[0] * DEVICE_PIXEL_RATIO,
            printPageRectangle = this.calculatePageBoundsPixels(),
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

    calculatePageBoundsPixels: function () {
        var s = this.get("scale").value,
            width = this.get("layout").map.width,
            height = this.get("layout").map.height,
            resolution = Radio.request("MapView", "getOptions").resolution,
            w = width / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * s / resolution * DEVICE_PIXEL_RATIO,
            h = height / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * s / resolution * DEVICE_PIXEL_RATIO,
            mapSize = Radio.request("Map", "getSize"),
            center = [mapSize[0] * DEVICE_PIXEL_RATIO / 2,
                mapSize[1] * DEVICE_PIXEL_RATIO / 2],
            minx, miny, maxx, maxy;

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
     * @returns {number} the optimal resolution
     */
    getOptimalResolution: function (scale, mapSize, printMapSize) {
        var dotsPerMeter = this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH"),
            resolutionX = printMapSize[0] * scale / (dotsPerMeter * mapSize[0]),
            resolutiony = printMapSize[1] * scale / (dotsPerMeter * mapSize[1]);

        return Math.max(resolutionX, resolutiony);
    },

    /**
     * returns the size of the map on the report
     * @returns {number[]} width and height
     */
    getPrintMapSize: function () {
        var layoutMapInfo = this.getAttributeInLayoutByName("map");

        return [layoutMapInfo.width, layoutMapInfo.height];
    },

    /**
     * returns a capabilities attribute object of the current layout, corresponding to the given name
     * @param {string} name - name of the attribute to get
     * @returns {object|undefined} corresponding attribute or null
     */
    getAttributeInLayoutByName: function (name) {
        return this.get("currentLayout")[name];
    },

    setPrecomposeListener: function (value) {
        this.set("precomposeListener", value);
    },

    setPostcomposeListener: function (value) {
        this.set("postcomposeListener", value);
    },
    /**
     * @param {boolean} value - true if the current layout supports meta data
     * @returns {void}
     */
    setIsMetaDataAvailable: function (value) {
        this.set("isMetaDataAvailable", value);
    },
    // setter for title
    setTitle: function (value) {
        this.set("title", value);
    },
    /**
     * @param {object[]} value - current print layout
     * @returns {void}
     */
    setCurrentLayout: function (value) {
        this.set("currentLayout", value);
    },
    /**
     * @param {string} value - current print format
     * @returns {void}
     */
    setCurrentFormat: function (value) {
        this.set("currentFormat", value);
    },
    /**
     * @param {boolean} value - true if mapfish can print gfi
     * @returns {void}
     */
    setIsGfiAvailable: function (value) {
        this.set("isGfiAvailable", value);
    },
    /**
     * @param {boolean} value - true if gfi is active
     * @returns {void}
     */
    setIsGfiActive: function (value) {
        this.set("isGfiActive", value);
    },
    /**
     * @param {boolean} value - true if mapfish can print legend
     * @returns {void}
     */
    setIsLegendAvailable: function (value) {
        this.set("isLegendAvailable", value);
    },
    /**
     * @param {boolean} value - true if mapfish can print scale
     * @returns {void}
     */
    setIsScaleAvailable: function (value) {
        this.set("isScaleAvailable", value);
    },
    /**
     * @param {number} value - current print scale
     * @returns {void}
     */
    setCurrentScale: function (value) {
        this.set("currentScale", value.toString());
    },

    setLayoutList: function (layouts) {
        var that = this;

        _.each(layouts, function (layout) {
            that.get("layoutList").push(layout);
        });
    },
    setFormatList: function (formats) {
        var that = this;

        _.each(formats, function (format) {
            that.get("formatList").push(format.name);
        });
    },
    setScaleList: function (scales) {
        var that = this;

        _.each(scales, function (scale) {
            that.get("scaleList").push(scale.value);
        });
    },

    /**
     * @param {boolean} value - true if the scale is selected by the user
     * @returns {void}
     */
    setIsScaleSelectedManually: function (value) {
        this.set("isScaleSelectedManually", value);
    },
    setEventListener: function (value) {
        this.set("eventListener", value);
    }
});

export default PrintModel;
