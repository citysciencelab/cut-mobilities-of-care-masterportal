define([
    "underscore",
    "backbone",
    "backbone.radio",
    "modules/core/parser/defaultTree",
    "modules/core/parser/customTree"
], function () {
    var _ = require("underscore"),
        Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        DefaultTreeParser = require("modules/core/parser/defaultTree"),
        CustomTreeParser = require("modules/core/parser/customTree"),
        Preparser;

    Preparser = Backbone.Model.extend({
        url: "config.json",
        initialize: function () {
            this.fetch({async: false});
        },
        parse: function (response) {
           if (response.Portalconfig.Baumtyp === "default") {
                new DefaultTreeParser(response);
            }
            else {
                new CustomTreeParser(response);
            }
        }
    });

    return Preparser;
});
