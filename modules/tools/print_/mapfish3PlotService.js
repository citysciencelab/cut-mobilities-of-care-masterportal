import Tool from "../../core/modelList/tool/model";
import BuildSpecModel from "./buildSpec";
import {DEVICE_PIXEL_RATIO} from "ol/has.js";
import BuildCanvasModel from "./buildCanvas";

const PrintModel = Tool.extend(/** @lends PrintModel.prototype */{
    defaults: Object.assign({}, Tool.prototype.defaults, {
        // output filename
        filename: "report",
        // the id from the rest services json for the mapfish app
        mapfishServiceId: undefined,
        // the identifier of one of the available mapfish print configurations
        printAppId: "master",
        // available layouts of the specified print configuration
        layoutList: [],
        currentLayout: undefined,
        currentLayoutName: "",
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
        isLegendSelected: false,
        // true if the current layout supports scale
        isScaleAvailable: false,
        // the id from the rest services json for the plot app
        plotServiceId: undefined,
        deactivateGFI: false,
        renderToWindow: true,
        DOTS_PER_INCH: 72,
        INCHES_PER_METER: 39.37,
        glyphicon: "glyphicon-print",
        eventListener: undefined,
        moveendListener: undefined,
        dpiForPdf: 200,
        currentLng: "",
        // translations
        titleLabel: "",
        titlePlaceholder: "",
        layoutLabel: "",
        formatLabel: "",
        scaleLabel: "",
        withLegendLabel: "",
        withInfoLabel: "",
        printLabel: "",
        layoutNameList: []
    }),

    /**
     * @class PrintModel
     * @extends Tool
     * @memberof Tools.Print
     * @constructs
     * @property {String} filename="report" - Output filename
     * @property {undefined} mapfishServiceId=undefined - id from rest service json for mapfish app
     * @property {String} printAppId="master" - identifier of one of available mapfish print configurations
     * @property {Array} layoutList=[] - Array of available layouts of the specified print configuration
     * @property {undefined} currentLayout=undefined - Holder for the current selected layout
     * @property {string} currentLayoutName="" - Choose which layout is the current layout
     * @property {Array} formatList=[] - Array of available formats of the specified print configuration
     * @property {String} currentFormat="pdf" - The current Format
     * @property {undefined} currentScale=undefined - Holder for the current rpint scale
     * @property {String} title="PrintResult" - Initial title for the print page
     * @property {Boolean} isScaleSelectedManually=false - Flag if the scale was selected by the user over the view
     * @property {Boolean} isMetaDataAvailable=false - Flag if the current layout supports meta data
     * @property {Boolean} isGfiAvailable=false - Flag if the current layout supports gfi
     * @property {Boolean} isGfiActive=false - Flag if gfi is active
     * @property {Boolean} isLegendAvailable=false - Flag if the current layout supports legend
     * @property {Boolean} isLegendSelected=true - Flag if the legend is to be printed
     * @property {Boolean} isScaleAvailable=false - Flag if the current layout supports scale
     * @property {undefined} plotServiceId=undefined - id from the rest services json for the plot app
     * @property {Boolean} deactivateGFI=false - Flag if gfi is deactivated
     * @property {Boolean} renderToWindow=true - todo
     * @property {Number} DOTS_PER_INCH=72 - todo
     * @property {Number} INCHES_PER_METER=39.37 - todo
     * @property {String} glyphicon="glyphicon-print" - Icon for the print button
     * @property {Object} eventListener={} - todo
     * @property {Boolean} printLegend=false Flag if checkbox to print legend should be activated.
     * @property {String} currentLng "" contains the current language - view listens to it
     * @property {String} titleLabel Label text for print-window
     * @property {String} titlePlaceholder placeholder text for print-window
     * @property {String} layoutLabel Label text for print-window
     * @property {String} formatLabel Label text for print-window
     * @property {String} scaleLabel Label text for print-window
     * @property {String} legendLabel Label text for print-window
     * @property {String} printLabel Label text for print-window
     * @fires Core#RadioRequestMapViewGetOptions
     * @listens Print#ChangeIsActive
     * @listens MapView#RadioTriggerMapViewChangedOptions
     * @listens GFI#RadioTriggerGFIIsVisible
     * @listens Print#CreatePrintJob
     */
    initialize: function () {
        const channel = Radio.channel("Print");

        this.superInitialize();

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (model.get("layoutList").length === 0) {
                    this.getCapabilites(model, value);
                }
                this.togglePostrenderListener(model, value);
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

        this.listenTo(Radio.channel("i18next"), {
            "languageChanged": this.changeLang
        });

        this.changeLang(i18next.language);
    },

    /**
     * change language - sets default values for the language
     * @param {String} lng the language changed to
     * @returns {Void}  -
     */
    changeLang: function (lng) {
        this.set({
            titleLabel: i18next.t("common:modules.tools.print.titleLabel"),
            titlePlaceholder: i18next.t("common:modules.tools.print.titlePlaceholder"),
            layoutLabel: i18next.t("common:modules.tools.print.layoutLabel"),
            formatLabel: i18next.t("common:modules.tools.print.formatLabel"),
            scaleLabel: i18next.t("common:modules.tools.print.scaleLabel"),
            withLegendLabel: i18next.t("common:modules.tools.print.withLegendLabel"),
            printLabel: i18next.t("common:modules.tools.print.printLabel"),
            withInfoLabel: i18next.t("common:modules.tools.print.withInfoLabel"),
            vtlWarning: i18next.t("common:modules.tools.print.vtlWarning"),
            layoutNameList: i18next.t("common:modules.tools.print.layoutNameList", {returnObjects: true}),
            currentLng: lng
        });
    },

    /**
     * todo
     * @param {*} id - todo
     * @returns {void}
     */
    createMapFishServiceUrl: function (id) {
        const service = Radio.request("RestReader", "getServiceById", id),
            serviceUrl = service === undefined ? "" : service.get("url");

        this.setMapfishServiceUrl(serviceUrl);
    },
    /**
     * Gets the capabilities for a specific print configuration
     * @param {Backbone.Model} model - this
     * @param {boolean} value - is this tool activated or not
     * @returns {void}
     */
    getCapabilites: function (model, value) {
        let serviceUrl;

        if (value) {
            if (this.get("mapfishServiceId") !== undefined) {
                serviceUrl = Radio.request("RestReader", "getServiceById", this.get("mapfishServiceId")).get("url");
                this.setMapfishServiceUrl(serviceUrl);
                this.sendRequest(serviceUrl + this.get("printAppId") + "/capabilities.json", "GET", this.parseMapfishCapabilities);
            }
        }
    },

    /**
     * Sets the capabilities from mapfish resonse.
     * @param {object[]} response - config.yaml from mapfish.
     * @fires Core#RadioRequestMapViewGetOptions
     * @returns {void}
     */
    parseMapfishCapabilities: function (response) {
        this.setLayoutList(response.layouts);
        this.setCurrentLayout(this.chooseCurrentLayout(response.layouts, this.get("currentLayoutName")));
        this.setIsMetaDataAvailable(this.getAttributeInLayoutByName("metadata") !== undefined);
        this.setIsGfiAvailable(this.getAttributeInLayoutByName("gfi") !== undefined);
        this.setIsLegendAvailable(this.getAttributeInLayoutByName("legend") !== undefined);
        this.setIsScaleAvailable(this.getAttributeInLayoutByName("scale") !== undefined);
        this.setFormatList(response.formats);
        this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
        this.togglePostrenderListener(this, true);
    },

    /**
     * Choose the layout which is configured as currentlayout
     * @param {object[]} [layouts=[]] - All Layouts.
     * @param {string} [currentLayoutName=""] - The name from current layout.
     * @returns {object} The choosen current layout.
     */
    chooseCurrentLayout: function (layouts = [], currentLayoutName = "") {
        const currentLayout = layouts.filter(layout => layout.name === currentLayoutName);

        return currentLayout.length === 1 ? currentLayout[0] : layouts[0];
    },

    /**
     * todo
     * @returns {void}
     */
    print: function () {
        const visibleLayerList = Radio.request("Map", "getLayers").getArray().filter(layer => {
                return layer.getVisible() === true;
            }),
            attr = {
                "layout": this.get("currentLayout").name,
                "outputFilename": this.get("filename"),
                "outputFormat": this.get("currentFormat"),
                "attributes": {
                    "title": this.get("title"),
                    "map": {
                        "dpi": this.get("dpiForPdf"),
                        "projection": Radio.request("MapView", "getProjection").getCode(),
                        "center": Radio.request("MapView", "getCenter"),
                        "scale": this.get("currentScale")
                    }
                }
            };

        let spec = new BuildSpecModel(attr);

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
        spec.buildLayers(this.sortVisibleLayerListByZindex(visibleLayerList));

        if (this.get("isGfiAvailable")) {
            spec.buildGfi(this.get("isGfiSelected"), Radio.request("GFI", "getGfiForPrint"));
        }
        spec = spec.toJSON();

        spec = Radio.request("Util", "omit", spec, ["uniqueIdList"]);
        this.createPrintJob(this.get("printAppId"), encodeURIComponent(JSON.stringify(spec)), this.get("currentFormat"));
    },

    /**
     * sorts the visible layer list by zIndex from layer
     * layers with undefined zIndex come to the beginning of array
     * @param {array} visibleLayerList with visble layer
     * @returns {array} sorted visibleLayerList
     */
    sortVisibleLayerListByZindex: function (visibleLayerList) {
        const visibleLayerListWithZIndex = visibleLayerList.filter(layer => {
                return layer.getZIndex() !== undefined;
            }),
            visibleLayerListWithoutZIndex = Radio.request("Util", "differenceJs", visibleLayerList, visibleLayerListWithZIndex);

        visibleLayerListWithoutZIndex.push(Radio.request("Util", "sortBy", visibleLayerListWithZIndex, (layer) => layer.getZIndex()));

        return [].concat(...visibleLayerListWithoutZIndex);
    },

    /**
     * sends a request to create a print job
     * @param {string} printAppId - id of the print configuration
     * @param {string} payload - POST body
     * @param {string} format - print job output format
     * @returns {void}
     */
    createPrintJob: function (printAppId, payload, format) {
        const url = this.get("mapfishServiceUrl") + printAppId + "/report." + format;

        Radio.trigger("Util", "showLoader");
        this.sendRequest(url, "POST", this.waitForPrintJob, payload);
    },

    /**
     * Sends a request to get the status for a print job until it is finished.
     * @param {JSON} response - Response of print job.
     * @returns {void}
     */
    waitForPrintJob: function (response) {
        const printAppId = this.get("printAppId"),
            url = this.get("mapfishServiceUrl") + printAppId + "/status/" + response.ref + ".json";

        this.sendRequest(url, "GET", function (status) {
            // Error processing...
            if (!status.done) {
                this.waitForPrintJob(response);
            }
            else {
                Radio.trigger("Util", "hideLoader");
                window.open(this.get("mapfishServiceUrl") + printAppId + "/report/" + response.ref);
            }
        });
    },

    /**
     * if the tool is activated and there is a layout,
     * a callback function is registered to the postrender event of the map
     * @param {Backbone.Model} model - this
     * @param {boolean} value - is this tool activated or not
     * @returns {void}
     */
    togglePostrenderListener: function (model, value) {
        const canvasModel = new BuildCanvasModel(),
            foundVectorTileLayers = [];

        /*
         * Since MapFish 3 does not yet support VTL (see https://github.com/mapfish/mapfish-print/issues/659),
         * they are filtered in the following code and an alert is shown to the user informing him about which
         * layers will not be printed.
         */
        let visibleLayerList = Radio.request("Map", "getLayers").getArray().filter(layer => {
                if (layer.get("typ") === "VectorTile") {
                    foundVectorTileLayers.push(layer.get("name"));
                    return false;
                }
                return layer.getVisible() === true;
            }),
            canvasLayer;

        if (foundVectorTileLayers.length && this.get("isActive")) {
            Radio.trigger("Alert", "alert", `${this.get("vtlWarning")} ${foundVectorTileLayers.join(", ")}`);
        }

        visibleLayerList = this.sortVisibleLayerListByZindex(visibleLayerList);

        if (value && model.get("layoutList").length !== 0 && visibleLayerList.length >= 1) {
            canvasLayer = canvasModel.getCanvasLayer(visibleLayerList);
            this.setEventListener(canvasLayer.on("postrender", this.createPrintMask.bind(this)));
            this.setMoveendListener(Radio.request("Map", "registerListener", "moveend", this.updateCanvasLayer.bind(this)));
        }
        else {
            Radio.trigger("Map", "unregisterListener", this.get("eventListener"));
            Radio.trigger("Map", "unregisterListener", this.get("moveendListener"));
            this.setEventListener(undefined);
            this.setMoveendListener(undefined);
        }
        Radio.trigger("Map", "render");
    },

    /**
     * upate to draw the print page rectangle onto the canvas when the map changes
     * @returns {void}
     */
    updateCanvasLayer: function () {
        const canvasModel = new BuildCanvasModel();
        let visibleLayerList = Radio.request("Map", "getLayers").getArray().filter(layer => {
                return layer.getVisible() === true;
            }),
            canvasLayer = {};

        visibleLayerList = this.sortVisibleLayerListByZindex(visibleLayerList);

        Radio.trigger("Map", "unregisterListener", this.get("eventListener"));
        canvasLayer = canvasModel.getCanvasLayer(visibleLayerList);
        this.setEventListener(canvasLayer.on("postrender", this.createPrintMask.bind(this)));
    },

    /**
     * draws the print page rectangle onto the canvas
     * @param {ol.render.Event} evt - postrender
     * @returns {void}
     */
    createPrintMask: function (evt) {
        const frameState = evt.frameState,
            context = evt.context;

        let scale;

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
     * @param {CanvasRenderingContext2D} context - context of the postrender event
     * @returns {void}
     */
    drawMask: function (mapSize, context) {
        const ration = context.canvas.width > mapSize[0] ? DEVICE_PIXEL_RATIO : 1,
            mapWidth = mapSize[0] * ration,
            mapHeight = mapSize[1] * ration;

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
     * @param {CanvasRenderingContext2D} context - context of the postrender event
     * @returns {void}
     */
    drawPrintPage: function (mapSize, resolution, printMapSize, scale, context) {
        const ration = context.canvas.width > mapSize[0] ? DEVICE_PIXEL_RATIO : 1,
            center = [mapSize[0] * ration / 2, mapSize[1] * ration / 2],
            boundWidth = printMapSize[0] / this.get("DOTS_PER_INCH") / this.get("INCHES_PER_METER") * scale / resolution * ration,
            boundHeight = printMapSize[1] / this.get("DOTS_PER_INCH") / this.get("INCHES_PER_METER") * scale / resolution * ration,
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
        const mapWidth = mapSize[0] * resolution,
            mapHeight = mapSize[1] * resolution,
            scaleWidth = mapWidth * this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH") / printMapSize[0],
            scaleHeight = mapHeight * this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH") / printMapSize[1],
            scale = Math.min(scaleWidth, scaleHeight);

        let optimalScale = scaleList[0];

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
        const dotsPerMeter = this.get("INCHES_PER_METER") * this.get("DOTS_PER_INCH"),
            resolutionX = printMapSize[0] * scale / (dotsPerMeter * mapSize[0]),
            resolutiony = printMapSize[1] * scale / (dotsPerMeter * mapSize[1]);

        return Math.max(resolutionX, resolutiony);
    },

    /**
     * returns the size of the map on the report
     * @returns {number[]} width and height
     */
    getPrintMapSize: function () {
        const layoutMapInfo = this.getAttributeInLayoutByName("map").clientInfo;

        return [layoutMapInfo.width, layoutMapInfo.height];
    },

    /**
     * returns the supported scales of the map in the report
     * @returns {number[]} scale list
     */
    getPrintMapScales: function () {
        const layoutMapInfo = this.getAttributeInLayoutByName("map").clientInfo;

        return layoutMapInfo.scales.sort(this.sortNumbers);
    },

    /**
     * returns a capabilities attribute object of the current layout, corresponding to the given name
     * @param {string} name - name of the attribute to get
     * @returns {object|undefined} corresponding attribute or null
     */
    getAttributeInLayoutByName: function (name) {
        return this.get("currentLayout").attributes.find(function (attribute) {
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
        return layoutList.find(function (layout) {
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

    /**
     * Setter for placeholder.
     * @param {string} value - Placeholder for the title.
     * @returns {void}
     */
    setTitlePlaceholder: function (value) {
        this.set("titlePlaceholder", value);
    },

    /**
     * todo
     * @param {*} value  - todo
     * @returns {void}
     */
    setEventListener: function (value) {
        this.set("eventListener", value);
    },

    /**
     * todo
     * @param {*} value  - todo
     * @returns {void}
     */
    setMoveendListener: function (value) {
        this.set("moveendListener", value);
    }
});

export default PrintModel;
