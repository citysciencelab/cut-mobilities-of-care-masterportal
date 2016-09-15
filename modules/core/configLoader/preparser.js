define([
    "backbone",
    "modules/core/configLoader/parserDefaultTree",
    "modules/core/configLoader/parserCustomTree"
], function () {
    var Backbone = require("backbone"),
        DefaultTreeParser = require("modules/core/configLoader/parserDefaultTree"),
        CustomTreeParser = require("modules/core/configLoader/parserCustomTree"),
        Preparser;

    Preparser = Backbone.Model.extend({
        url: "config.json",
        initialize: function () {
            this.fetch({async: false});
        },
        parse: function (response) {
            var attributes = {
                portalConfig: response.Portalconfig,
                baselayer: response.Themenconfig.Hintergrundkarten,
                overlayer: response.Themenconfig.Fachdaten,
                treeType: response.Portalconfig.Baumtyp
            };

           if (attributes.treeType === "default") {
                new DefaultTreeParser(attributes);
            }
            else {
                new CustomTreeParser(attributes);
            }
        }
    });

    return Preparser;
});
