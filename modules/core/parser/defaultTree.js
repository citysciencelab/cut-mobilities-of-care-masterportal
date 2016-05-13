define("Parser", [
    "backbone.radio",
    "modules/core/parser/portalConfig"
], function () {

     var Parser = require("modules/core/parser/portalConfig"),
        Radio = require("backbone.radio"),
        DefaultTreeParser;

    DefaultTreeParser = Parser.extend({
        initialize: function () {
            var rawLayerList = Radio.request("RawLayerList", "getLayerAttributesList");

            console.log("default");
            this.parseTree(rawLayerList);
        },

        /**
         *
         */
        parseTree: function (rawLayerList) {

        }
    });

    return DefaultTreeParser;
});
