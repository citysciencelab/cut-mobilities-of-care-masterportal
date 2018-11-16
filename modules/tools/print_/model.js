import Tool from "../../core/modelList/tool/model";
import BuildSpecModel from "./buildSpec";
import {DEVICE_PIXEL_RATIO} from "ol/has.js";

const PrintModel = Tool.extend({
    defaults: _.extend({}, Tool.prototype.defaults, {
        // output filename
        filename: "report",
        // the id from the rest services json for the mapfish app
        mapfishServiceId: undefined,
        // the identifier of one of the available mapfish print configurations
        printAppId: "master",
        // available layouts of the specified print configuration
        layoutList: [],
        currentLayout: undefined,
        // available formats of the specified print configuration
        formatList: [],
        currentFormat: "pdf",
        // current print scale
        currentScale: undefined,
        // title for the report
        title: "PrintResult",
        // is scale selected by the user over the view
        isScaleSelectedManually: false,
        // true if the current layout supports meta data
        isMetaDataAvailable: false,
        // true if the current layout supports gfi
        isGfiAvailable: false,
        // true if gfi is to be printed
        isGfiSelected: false,
        // true if gfi is active
        isGfiActive: false,
        // true if the current layout supports legend
        isLegendAvailable: false,
        // true if the legend is to be printed
        isLegendSelected: true,
        // true if the current layout supports scale
        isScaleAvailable: false,
        // the id from the rest services json for the plot app
        plotServiceId: undefined,
        deactivateGFI: false,
        renderToWindow: true,
        DOTS_PER_INCH: 72,
        INCHES_PER_METER: 39.37,
        glyphicon: "glyphicon-print",
        eventListener: {}
    }),
    initialize: function () {
        var channel = Radio.channel("Print");

        this.superInitialize();

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (model.get("layoutList").length === 0) {
                    this.getCapabilites(model, value);
                }
                this.togglePostcomposeListener(model, value);
            }
        });

        this.listenTo(Radio.channel("MapView"), {
            "changedOptions": function () {
                this.setIsScaleSelectedManually(false);
            }
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
        this.createMapFishServiceUrl(this.get("mapfishServiceId"));
    },

    createMapFishServiceUrl: function (id) {
        var serviceUrl = Radio.request("RestReader", "getServiceById", id).get("url");

        this.setMapfishServiceUrl(serviceUrl);
    },
    /**
     * Gets the capabilities for a specific print configuration
     * @param {Backbone.Model} model - this
     * @param {boolean} value - is this tool activated or not
     * @returns {void}
     */
    getCapabilites: function (model, value) {
        var serviceUrl;

        if (value) {
            if (this.get("mapfishServiceId") !== undefined) {
                serviceUrl = Radio.request("RestReader", "getServiceById", this.get("mapfishServiceId")).get("url");
                this.setMapfishServiceUrl(serviceUrl);
                this.sendRequest(serviceUrl + this.get("printAppId") + "/capabilities.json", "GET", this.parseMapfishCapabilities);
            }
            // if (this.get("plotServiceId") !== undefined) {
            //     serviceUrl = Radio.request("RestReader", "getServiceById", this.get("plotServiceId")).get("url");
            //     this.sendRequest();
            // }
        }
    },

    parseMapfishCapabilities: function (response) {
        this.setLayoutList(response.layouts);
        this.setCurrentLayout(response.layouts[0]);
        this.setIsMetaDataAvailable(!_.isUndefined(this.getAttributeInLayoutByName("metadata")));
        this.setIsGfiAvailable(!_.isUndefined(this.getAttributeInLayoutByName("gfi")));
        this.setIsLegendAvailable(!_.isUndefined(this.getAttributeInLayoutByName("legend")));
        this.setIsScaleAvailable(!_.isUndefined(this.getAttributeInLayoutByName("scale")));
        this.setFormatList(response.formats);
        this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
        this.togglePostcomposeListener(this, true);
    },

    print: function () {
        var visibleLayerList = Radio.request("Map", "getLayers").getArray().filter(function (layer) {
                return layer.getVisible() === true;
            }),
            attr = {
                "layout": this.get("currentLayout").name,
                "outputFilename": this.get("filename"),
                "outputFormat": this.get("currentFormat"),
                "attributes": {
                    "title": this.get("title"),
                    "map": {
                        "dpi": 96,
                        "projection": Radio.request("MapView", "getProjection").getCode(),
                        "center": Radio.request("MapView", "getCenter"),
                        "scale": this.get("currentScale")
                    }
                }
            },
            spec;

        spec = new BuildSpecModel(attr);
        if (this.get("isMetaDataAvailable")) {
            spec.setMetadata(true);
        }
        if (this.get("isLegendAvailable")) {
            if (this.get("isLegendSelected")) {
                Radio.trigger("Legend", "setLayerList");
            }
            spec.buildLegend(this.get("isLegendSelected"), Radio.request("Legend", "getLegendParams"), this.get("isMetaDataAvailable"));
        }
        if (this.get("isScaleAvailable")) {
            spec.buildScale(this.get("currentScale"));
        }
        spec.buildLayers(visibleLayerList);
        if (this.get("isGfiAvailable")) {
            spec.buildGfi(this.get("isGfiSelected"), Radio.request("GFI", "getGfiForPrint"));
        }
        spec = spec.toJSON();

        spec = _.omit(spec, "uniqueIdList");
        this.createPrintJob(this.get("printAppId"), encodeURIComponent(JSON.stringify(spec)), this.get("currentFormat"));
    },

    /**
     * sends a request to create a print job
     * @param {string} printAppId - id of the print configuration
     * @param {string} payload - POST body
     * @param {string} format - print job output format
     * @returns {void}
     */
    createPrintJob: function (printAppId, payload, format) {
        var url = this.get("mapfishServiceUrl") + printAppId + "/report." + format;

        Radio.trigger("Util", "showLoader");
        this.sendRequest(url, "POST", this.waitForPrintJob, payload);
    },

    /**
     * sends a request to get the status for a print job until it is finished
     * @param {JSON} response -
     * @returns {void}
     */
    waitForPrintJob: function (response) {
        var url = this.get("mapfishServiceUrl") + "status/" + response.ref + ".json";

        this.sendRequest(url, "GET", function (status) {
            // Fehlerverarbeitung...
            if (!status.done) {
                this.waitForPrintJob(response);
            }
            else {
                Radio.trigger("Util", "hideLoader");
                window.open(this.get("mapfishServiceUrl") + "report/" + response.ref);
            }
        });
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
        this.drawMask(frameState, context);
        this.drawPrintPage(frameState.size, frameState.viewState.resolution, this.getPrintMapSize(), scale, context);
        context.fillStyle = "rgba(0, 5, 25, 0.55)";
        context.fill();
    },

    /**
     * draws a mask on the whole map
     * @param {object} frameState - representing the current render frame state
     * @param {CanvasRenderingContext2D} context - context of the postcompose event
     * @returns {void}
     */
    drawMask: function (frameState, context) {
        var mapWidth = frameState.size[0] * DEVICE_PIXEL_RATIO,
            mapHeight = frameState.size[1] * DEVICE_PIXEL_RATIO;

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
        var center = [mapSize[0] / 2, mapSize[1] / 2],
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
        var layoutMapInfo = this.getAttributeInLayoutByName("map").clientInfo;

        return [layoutMapInfo.width, layoutMapInfo.height];
    },

    /**
     * returns the supported scales of the map in the report
     * @returns {number[]} scale list
     */
    getPrintMapScales: function () {
        var layoutMapInfo = this.getAttributeInLayoutByName("map").clientInfo;

        return layoutMapInfo.scales.sort(this.sortNumbers);
    },

    /**
     * returns a capabilities attribute object of the current layout, corresponding to the given name
     * @param {string} name - name of the attribute to get
     * @returns {object|undefined} corresponding attribute or null
     */
    getAttributeInLayoutByName: function (name) {
        return _.find(this.get("currentLayout").attributes, function (attribute) {
            return attribute.name === name;
        });
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

    /**
     * sorts an array numerically and ascending
     * @param {number} a - first value
     * @param {number} b - next value
     * @returns {number} a negative, zero, or positive value
     */
    sortNumbers: function (a, b) {
        return a - b;
    },

    /**
     * Performs an asynchronous HTTP request
     * @param {string} serviceUrl - the url of the print service
     * @param {string} requestType - GET || POST
     * @param {function} successCallback - called if the request succeeds
     * @param {JSON} data - payload
     * @returns {void}
     */
    sendRequest: function (serviceUrl, requestType, successCallback, data) {
        $.ajax({
            url: Radio.request("Util", "getProxyURL", serviceUrl),
            type: requestType,
            data: data,
            context: this,
            success: successCallback
        });
    },

    /**
     * @param {object[]} value - available layouts of the specified print configuration
     * @returns {void}
     */
    setLayoutList: function (value) {
        this.set("layoutList", value);
    },

    /**
     * @param {object[]} value - current print layout
     * @returns {void}
     */
    setCurrentLayout: function (value) {
        this.set("currentLayout", value);
    },

    /**
     * @param {string[]} value - available formats of the specified print configuration
     * @returns {void}
     */
    setFormatList: function (value) {
        this.set("formatList", value);
    },

    /**
     * @param {string} value - current print format
     * @returns {void}
     */
    setCurrentFormat: function (value) {
        this.set("currentFormat", value);
    },

    /**
     * @param {number} value - current print scale
     * @returns {void}
     */
    setCurrentScale: function (value) {
        this.set("currentScale", value);
    },

    /**
     * @param {boolean} value - true if the legend is to be printed
     * @returns {void}
     */
    setIsLegendSelected: function (value) {
        this.set("isLegendSelected", value);
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
     * @param {boolean} value - true if gfi is to be printed
     * @returns {void}
     */
    setIsGfiSelected: function (value) {
        this.set("isGfiSelected", value);
    },

    /**
     * @param {boolean} value - true if the current layout supports meta data
     * @returns {void}
     */
    setIsMetaDataAvailable: function (value) {
        this.set("isMetaDataAvailable", value);
    },

    /**
     * @param {string} value - title for the printout
     * @returns {void}
     */
    setTitle: function (value) {
        this.set("title", value);
    },

    /**
     * @param {boolean} value - true if the scale is selected by the user
     * @returns {void}
     */
    setIsScaleSelectedManually: function (value) {
        this.set("isScaleSelectedManually", value);
    },

    /**
     * @param {string} value - mapfish print service url
     * @returns {void}
     */
    setMapfishServiceUrl: function (value) {
        this.set("mapfishServiceUrl", value);
    },
    setEventListener: function (value) {
        this.set("eventListener", value);
    }
});

export default PrintModel;
