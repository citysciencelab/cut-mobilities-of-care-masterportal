define(function (require) {
    var Tool = require("modules/core/modelList/tool/model"),
        ol = require("openlayers"),
        $ = require("jquery"),
        PrintModel;

    PrintModel = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            // the id from the rest services json for the mapfish app
            mapfishServiceId: undefined,
            // the identifier of one of the available mapfish print configurations
            printAppId: "default",
            // title for the printout
            title: "",
            layoutList: [],
            currentLayout: undefined,
            formatList: [],
            currentFormat: "pdf",
            scaleList: [],
            currentScale: undefined,
            // does the current layout have a legend
            isLegendAvailable: true,
            // the id from the rest services json for the plot app
            plotServiceId: undefined,
            deaktivateGFI: false,
            renderToWindow: true,
            MM_PER_INCHES: 25.4,
            POINTS_PER_INCH: 72 // PostScript points 1/72"
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
                    this.setCurrentScale(options.scale);
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
                    serviceUrl = Radio.request("RestReader", "getServiceById", this.get("mapfishServiceId")).get("url") + this.get("printAppId") + "/capabilities.json";
                    this.sendRequest(serviceUrl, "GET", this.parseMapfishCapabilities);
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
            this.setScaleList(this.createScaleList(Radio.request("MapView", "getScales")));
            this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
            this.togglePostcomposeListener(this, true);
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
         * creates the scale objects with display name and value
         * is needed for the template
         * @param {number[]} scales - scales from the map view
         * @returns {object[]} scaleList
         */
        createScaleList: function (scales) {
            var scaleList = [];

            scales.forEach(function (scale) {
                var scaleText = scale.toString();

                if (scale >= 10000) {
                    scaleText = scaleText.substring(0, scaleText.length - 3) + " " + scaleText.substring(scaleText.length - 3);
                }
                scaleList.push({value: scale, displayText: scaleText});
            });
            return scaleList;
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
         * Performs an asynchronous HTTP request
         * @param {string} serviceUrl - the url of the print service
         * @param {string} requestType - GET || POST
         * @param {function} successCallback -
         * @returns {void}
         */
        sendRequest: function (serviceUrl, requestType, successCallback) {
            $.ajax({
                url: serviceUrl,
                type: requestType,
                context: this,
                success: successCallback
            });
        },

        togglePostcomposeListener: function (model, value) {
            if (value && model.get("layoutList").length !== 0) {
                Radio.trigger("Map", "registerListener", "postcompose", this.renderPrintPage, this);
            }
            else {
                Radio.trigger("Map", "unregisterListener", "postcompose", this.renderPrintPage, this);
            }
            Radio.trigger("Map", "render");
        },

        /**
         * draws the print page rectangle onto the canvas
         * @param {ol.render.Event} evt -
         * @returns {void}
         */
        renderPrintPage: function (evt) {
            var map = evt.target,
                ctx = evt.context, // Canvas context
                resolution = map.getView().getResolution(),
                printPageRectangle = this.calculatePageBoundsPixels(map, resolution, this.get("currentScale"), this.get("currentLayout")),
                mapWidth = map.getSize()[0] * ol.has.DEVICE_PIXEL_RATIO,
                mapHeight = map.getSize()[1] * ol.has.DEVICE_PIXEL_RATIO,
                minx = printPageRectangle[0],
                miny = printPageRectangle[1],
                maxx = printPageRectangle[2],
                maxy = printPageRectangle[3];

            ctx.beginPath();
            // Outside polygon, must be clockwise
            ctx.moveTo(0, 0);
            ctx.lineTo(mapWidth, 0);
            ctx.lineTo(mapWidth, mapHeight);
            ctx.lineTo(0, mapHeight);
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
        },

        /**
         * @param {ol.map} map -
         * @param {number} resolution - print resolution
         * @param {number} scale -
         * @param {object} layout - current print layout
         * @returns {number[]} page bounds
         */
        calculatePageBoundsPixels: function (map, resolution, scale, layout) {
            var resolutions = map.getView().getResolutions(),
                indexResolution = resolutions.indexOf(resolution),
                centerCoordinate = map.getView().getCenter(),
                centerPixel = map.getPixelFromCoordinate(centerCoordinate),
                pageWidth = layout.attributes[1].clientInfo.width, // Pixel??
                pageHeight = layout.attributes[1].clientInfo.height,
                boundWidth = pageWidth / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * scale / resolution * ol.has.DEVICE_PIXEL_RATIO,
                boundHeight = pageHeight / this.get("POINTS_PER_INCH") * this.get("MM_PER_INCHES") / 1000.0 * scale / resolution * ol.has.DEVICE_PIXEL_RATIO,
                minx, miny, maxx, maxy;

            if (boundWidth >= map.getSize()[0] || boundHeight >= map.getSize()[1]) {
                return this.calculatePageBoundsPixels(map, resolutions[indexResolution - 1], scale, layout);
            }
            minx = centerPixel[0] - (boundWidth / 2);
            miny = centerPixel[1] - (boundHeight / 2);
            maxx = centerPixel[0] + (boundWidth / 2);
            maxy = centerPixel[1] + (boundHeight / 2);

            return [minx, miny, maxx, maxy];
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
         * @param {number[]} value - available scales of the map
         * @returns {void}
         */
        setScaleList: function (value) {
            this.set("scaleList", value);
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
        }
    });

    return PrintModel;
});
