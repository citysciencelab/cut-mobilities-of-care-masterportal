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
                require(["modules/core/parser/defaultTree"], function (DefaultTreeParser) {
                    new DefaultTreeParser(response.Themenconfig);
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
        addItem: function (obj) {
            this.get("itemList").push(obj);
        },

        /**
         *  Ermöglicht ein Array von Objekten, die alle attr gemeinsam haben zu erzeugen
         */
        addItems: function (objs, attr) {
            _.each(objs, function (obj) {
                this.addItem(_.extend(obj, attr));
            }, this);
        },

        /**
         *
         */
        getItemList: function () {
            return this.get("itemList");
        },
        /**
         *
         */
        getHintergrundkarten () {
            return this.get("Hintergrundkarten");
        },
        /**
         *
         */
        setHintergrundkarten (hintergrundkarten) {
            return this.set("Hintergrundkarten", hintergrundkarten);
        }
    });

    return Parser;
});
