define([
    "backbone",
    "modules/core/parser/defaultTree",
    "modules/core/parser/customTree"
], function () {
    var Backbone = require("backbone"),
        DefaultTreeParser = require("modules/core/parser/defaultTree"),
        CustomTreeParser = require("modules/core/parser/customTree"),
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
