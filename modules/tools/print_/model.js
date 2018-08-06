define(function (require) {
    var Tool = require("modules/core/modelList/tool/model"),
        $ = require("jquery"),
        PrintView = require("modules/tools/print_/view"),
        PrintModel;

    PrintModel = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            // the id from the rest services json for the mapfish app
            mapfishServiceId: undefined,
            // the identifier of one of the available mapfish print configurations
            printAppId: "default",
            // the id from the rest services json for the plot app
            plotServiceId: undefined
        }),

        initialize: function () {
            this.superInitialize();

            // listen until the tool is activated for the first time
            this.listenTo(this, {
                "change:isActive": this.getCapabilites
            });
            new PrintView({model: this});
        },

        /**
         * Gets the capabilities for a specific print configuration
         * @param {boolean} isActive - is this tool activated or not
         * @returns {void}
         */
        getCapabilites: function (isActive) {
            var serviceUrl;

            if (isActive) {
                if (this.get("mapfishServiceId") !== undefined) {
                    serviceUrl = Radio.request("RestReader", "getServiceById", this.get("mapfishServiceId")).get("url") + this.get("printAppId") + "/capabilities.json";
                    this.sendRequest(serviceUrl, "GET", this.parseMapfishCapabilities);
                }
                // if (this.get("plotServiceId") !== undefined) {
                //     serviceUrl = Radio.request("RestReader", "getServiceById", this.get("plotServiceId")).get("url");
                //     this.sendRequest();
                // }
                this.stopListening();
            }
        },

        parseMapfishCapabilities: function (response) {
            // console.log(response);
            // this.parseScaleList();
            // this.parseLayoutNames();
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
                success: successCallback
            });
        }
    });

    return PrintModel;
});
