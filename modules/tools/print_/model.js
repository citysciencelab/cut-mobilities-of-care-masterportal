define(function (require) {
    var Tool = require("modules/core/modelList/tool/model"),
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
            renderToWindow: true
        }),

        initialize: function () {
            this.superInitialize();

            // listen until the tool is activated for the first time
            this.listenTo(this, {
                "change:isActive": this.getCapabilites
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
                this.stopListening(this, "change:isActive", this.getCapabilites);
            }
        },

        parseMapfishCapabilities: function (response) {
            this.setLayoutList(response.layouts);
            this.setCurrentLayout(response.layouts[0]);
            this.setIsLegendAvailable(this.isLegendAvailable(response.layouts[0]));
            this.setFormatList(response.formats);
            this.setScaleList(this.createScaleList(Radio.request("MapView", "getScales")));
            this.setCurrentScale(Radio.request("MapView", "getOptions").scale);
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
