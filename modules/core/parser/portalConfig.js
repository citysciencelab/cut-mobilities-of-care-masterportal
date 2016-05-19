define([
    "underscore",
    "backbone",
    "backbone.radio",
    "modules/core/modellist/list"
], function () {

    var _ = require("underscore"),
        Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ModelList = require("modules/core/modellist/list"),
        Parser;

    Parser = Backbone.Model.extend({
        defaults: {
            //
            itemList: [],
            // Themenconfig.Fachdaten
            Fachdaten: [],
            // Themenconfig.Hintergrundkarten
            Hintergrundkarten: [],
            // Der Desktoptreetype
            portalConfig: {}
        },
        // Pfad zur config
        url: "config.json",
        initialize: function () {
            var channel = Radio.channel("Parser");

            channel.reply({
                "getPortalConfig": this.getPortalConfig
            }, this);
            this.fetch();
        },
        /**
         *
         */
        parse: function (response) {
            this.parseMenu(response.Portalconfig.menu, "root");
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
            this.setPortalConfig(response.Portalconfig);
        },
        /**
         * Parsed die Menüeinträge (alles außer dem Inhalt des Baumes)
         */
        parseMenu: function (menuLevel, parentId) {
            var currentLevel = _.pairs(menuLevel);
            _.each(currentLevel, function (pair) {
                if (_.isObject(pair[1])){
                    this.parseMenu(pair[1], pair[0]);
                }
                else {
                    var type = "";

                    switch (pair[0]) {
                        case "parcelSearch":
                        case "gfi":
                        case "print":
                        case "coord":
                        case "measure":
                        case "draw":
                        case "routing":
                        case "addWMS": {
                            type = "tool";
                            break;
                        }
                        default: {
                            type = "folder";
                            break;
                        }
                    }
                    this.addItem({
                    type: type,
                    title: pair[0],
                    parentId: parentId,
                    name: pair[0]
                    });
                }
            }, this);
        },
        /**
         * Fügt dem Attribut "itemList" ein Item(layer, folder, ...) hinzu
         * @param {Object} obj - Item
         */
        addItem: function (obj) {
            if (!_.isUndefined(obj.visibility)) {
                obj.isVisibleInMap = obj.visibility;
                delete obj.visibility;
            }
            this.getItemList().push(obj);
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
        },
        /**
          * Getter für Attribut "treeType"
          * @return {String}
          */
        getPortalConfig: function () {
             return this.get("portalConfig");
        },
        /**
          * Getter für Attribut "treeType"
          * @return {String}
          */
        setPortalConfig: function (portalConfig) {
             return this.set("portalConfig", portalConfig);
        },
        /**
         * [createModelList description]
         * @return {[type]} [description]
         */
        createModelList: function () {
            new ModelList(this.getItemList());
        }
    });

    return Parser;
});
