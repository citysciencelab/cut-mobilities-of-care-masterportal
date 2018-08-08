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
            layoutNameList: [],
            // the id from the rest services json for the plot app
            plotServiceId: undefined,
            deaktivateGFI: false
        }),

        initialize: function () {
            this.superInitialize();

            this.listenTo(this, {
                "change:isActive": this.getCapabilites
            });
        },

        /**
         * Gets the capabilities for a specific print configuration
         * or firing 'render' at the view
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
                // this.stopListening();
            }
        },

        parseMapfishCapabilities: function (response) {
            this.setLayoutList(response.layouts);
            this.parseLayoutNames(this.get("layoutNameList"), response.layouts);
        },

        parseLayoutNames: function (layoutNameList, layoutList) {
            layoutList.forEach(function (layout) {
                layoutNameList.push(layout.name);
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
        }
    });

    return PrintModel;
});
