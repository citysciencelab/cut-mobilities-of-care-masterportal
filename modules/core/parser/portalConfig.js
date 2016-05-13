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

            channel.reply({
                "getItemList": function () {
                    return this.getItemList()
                }
            }, this);

            this.fetch();
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
         * Fügt dem Attribut "itemList" ein Item(layer, folder, ...) hinzu
         * @param {Object} obj - Item
         */
        addItem: function (obj) {
            this.getItemList().push(obj);
        },

        /**
         * Getter für das Attribut "itemList"
         * @return {Array}
         */
        getItemList: function () {
            return this.get("itemList");
        },

        /**
         * Getter für Attribut "Hintergrundkarten"
         * @return {Object}
         */
        getBaselayer: function () {
            return this.get("Hintergrundkarten");
        },

         /**
          * Getter für Attribut "Fachdaten"
          * @return {Object}
          */
        getOverlayer: function () {
            return this.get("Fachdaten");
        }
    });

    return Parser;
});
