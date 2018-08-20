define(function (require) {
    var Tool = require("modules/core/modelList/tool/model"),
        ol = require("openlayers"),
        $ = require("jquery"),
        PrintModel;

    PrintModel = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            // the id from the rest services json for the mapfish app
            mapfishServiceId: undefined,
            // mapfishServiceUrl
            // the identifier of one of the available mapfish print configurations
            printAppId: "default",
            // title for the printout
            title: "",
            layoutList: [],
            currentLayout: undefined,
            formatList: [],
            currentFormat: "pdf",
            currentScale: undefined,
            // does the current layout have a legend
            isLegendAvailable: true,
            // the id from the rest services json for the plot app
            plotServiceId: undefined,
            deaktivateGFI: false,
            renderToWindow: true,
            DOTS_PER_INCH: 72,
            INCHES_PER_METER: 39.37
        }),

        initialize: function () {
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
                "changedOptions": function (options) {
                    // this.setCurrentScale(options.scale);
                }
            });
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
            this.setIsLegendAvailable(this.isLegendAvailable(response.layouts[0]));
            this.setFormatList(response.formats);
            this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
            this.togglePostcomposeListener(this, true);
        },

        print: function () {
            var t = {
                "layout": "A4 Hochformat",
                "outputFormat": "pdf",
                "attributes": {
                    "title": "Ttest",
                    "map": {
                        "projection": "EPSG:25832",
                        "dpi": 150,
                        "rotation": 0,
                        "center": [561210, 5932600],
                        "scale": 60000,
                        "layers": [{
                            "baseURL": "https://geodienste.hamburg.de/wms_hamburgde",
                            "opacity": 1,
                            "type": "WMS",
                            "layers": [
                                "geobasisdaten"
                            ],
                            "imageFormat": "image/png",
                            "customParams": {
                                "TRANSPARENT": "true"
                            }
                        }]
                    }
                }
            };

            this.createPrintJob(this.get("printAppId"), JSON.stringify(t), this.get("currentFormat"));
        },

        /**
         * checks if the current layout has a legend
         * @param {object} layout - current print layout
         * @returns {boolean} true if the current layout has a legend otherwise false
         */
        isLegendAvailable: function (layout) {
            return layout.attributes.some(function (attribute) {
                return attribute.name === "legend";
            });
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

            this.sendRequest(url, "POST", this.waitForPrintJob, payload);
        },

        /**
         * sends a request to get the status for a print job until it is finished
         * @param {JSON} response -
         * @returns {void}
         */
        waitForPrintJob: function (response) {
            var url = this.get("mapfishServiceUrl") + "/status/" + response.ref + ".json";

            this.sendRequest(url, "GET", function (status) {
                // Fehlerverarbeitung...
                if (!status.done) {
                    this.waitForPrintJob(response);
                }
                else {
                    window.open(this.get("mapfishServiceUrl") + "/report/" + response.ref);
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
                Radio.trigger("Map", "registerListener", "postcompose", this.createPrintMask, this);
            }
            else {
                Radio.trigger("Map", "unregisterListener", "postcompose", this.createPrintMask, this);
            }
            Radio.trigger("Map", "render");
        },

        /**
         * draws the print page rectangle onto the canvas
         * @param {ol.render.Event} evt - postcompose
         * @returns {void}
         */
        createPrintMask: function (evt) {
            var frameState = evt.frameState, // representing the current render frame state
                layoutMapInfo = this.getAttributeInLayoutByName("map").clientInfo,
                context = evt.context, // CanvasRenderingContext2D
                scale = this.getOptimalScale(frameState.size, frameState.viewState.resolution, [layoutMapInfo.width, layoutMapInfo.height], layoutMapInfo.scales.sort(this.sortNumbers));

            this.drawMask(frameState, context);
            this.drawPrintPage(frameState.size, frameState.viewState.resolution, scale, context);
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
            var mapWidth = frameState.size[0] * ol.has.DEVICE_PIXEL_RATIO,
                mapHeight = frameState.size[1] * ol.has.DEVICE_PIXEL_RATIO;

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
         * @param {number} scale - the optimal print scale
         * @param {CanvasRenderingContext2D} context - context of the postcompose event
         * @returns {void}
         */
        drawPrintPage: function (mapSize, resolution, scale, context) {
            var center = [mapSize[0] / 2, mapSize[1] / 2],
                printMapWidth = this.getAttributeInLayoutByName("map").clientInfo.width,
                printMapHeight = this.getAttributeInLayoutByName("map").clientInfo.height,
                boundWidth = printMapWidth / this.get("DOTS_PER_INCH") / this.get("INCHES_PER_METER") * scale / resolution * ol.has.DEVICE_PIXEL_RATIO,
                boundHeight = printMapHeight / this.get("DOTS_PER_INCH") / this.get("INCHES_PER_METER") * scale / resolution * ol.has.DEVICE_PIXEL_RATIO,
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
         * @param {ol.Size} printMapSize - size of the map on the paper in dots
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
                url: serviceUrl,
                type: requestType,
                contentType: "application/json; charset=UTF-8",
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
         * @param {number} value - current map scale
         * @returns {void}
         */
        setCurrentScale: function (value) {
            this.set("currentScale", value);
        },

        /**
         * @param {boolean} value - true if the current layout has a legend
         * @returns {void}
         */
        setIsLegendAvailable: function (value) {
            this.set("isLegendAvailable", value);
        },

        /**
         * @param {string} value - title for the printout
         * @returns {void}
         */
        setTitle: function (value) {
            this.set("title", value);
        },

        /**
         * @param {string} value - mapfish print service url
         * @returns {void}
         */
        setMapfishServiceUrl: function (value) {
            this.set("mapfishServiceUrl", value);
        }
    });

    return PrintModel;
});
