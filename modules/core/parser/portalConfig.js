define([
    "backbone",
    "backbone.radio"
], function () {

     var Backbone = require("backbone"),
         Radio = require("backbone.radio"),
         Parser;

    Parser = Backbone.Model.extend({
        defaults: {
            //
            itemList: [],
            // Themenconfig.Fachdaten
            Fachdaten: [],
            // Themenconfig.Hintergrundkarten
            Hintergrundkarten: []
        },
        // Pfad zur config
        url: "config.json",
        initialize: function () {
            var channel = Radio.channel("Parser");

            channel.listenTo(this, {
                "fetchSuccess": function () {console.log("fertig");
                    channel.trigger("ich_bin_fertig");
                }
            });

            this.fetchConfig();
        },

        /**
         *
         */
        fetchConfig: function () {
            this.fetch({
                context: this,
                success: function () {
                    this.trigger("fetchSuccess");
                }
            });
        },

        /**
         *
         */
        parse: function (response) {
            if (response.Portalconfig.Baumtyp === "default") {
                require(["modules/core/parser/defaultTree"], function (DefaultTree) {
                    new DefaultTree();
                });
            }
            else {
                require(["modules/core/parser/customTree"], function (CustomTreeParser) {
                    new CustomTreeParser(response.Themenconfig);
                });
            }
        },

        /**
         *
         */
        createItem: function () {
        },

        /**
         *
         */
        getItemList: function () {
            return this.get("itemList");
        }
    });

    return Parser;
});
