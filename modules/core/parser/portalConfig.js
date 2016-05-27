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
            rawLayerList: [],
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
                "getPortalConfig": this.getPortalConfig,
                "getItemsByParentId": this.getItemsByParentId,
                "getItemsByAttributes": function (attributes) {
                    return _.where(this.getItemList(), attributes);
                }
            }, this);

            this.fetch({async: false});
        },

        /**
         *
         */
        parse: function (response) {
            this.parseMenu(response.Portalconfig.menu, "root");
            if (response.Portalconfig.Baumtyp === "default") {
                this.addTreeMenuItems();
                require(["modules/core/parser/defaultTree"], function (DefaultTreeParser) {
                    new DefaultTreeParser(response.Themenconfig);
                });
            }
            else {
                if (response.Portalconfig.Baumtyp === "custom") {
                    this.addTreeMenuItems();
                }
                require(["modules/core/parser/customTree"], function (CustomTreeParser) {
                    new CustomTreeParser(response.Themenconfig);
                });
            }
            this.setPortalConfig(response.Portalconfig);
        },
        /**
         * Parsed die Menüeinträge (alles außer dem Inhalt des Baumes)
         */
        parseMenu: function (items, parentId) {
            // Pair: (name, items)
            var currentLevel = _.pairs(items);

            _.each(currentLevel, function (pair) {
                var name = pair[0],
                    value = pair[1];

                if (_.isObject(value)) {
                    this.parseMenu(value, name);
                }
                var type = "";

                switch (name) {
                    case "parcelSearch":
                    case "gfi":
                    case "print":
                    case "coord":
                    case "measure":
                    case "draw":
                    case "routing":
                    case "searchByCoord":
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
                    // title: pair[0],
                    parentId: parentId,
                    name: name,
                    id: name
                });
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
            new ModelList(_.filter(this.getItemList(), function (model) {
                return model.parentId === "root" ||
                    model.parentId === "tools" ||
                    model.parentId === "themen";
            }));
        },

        getItemsByParentId: function (value) {
            return _.where(this.getItemList(), {parentId: value});
        },

        addTreeMenuItems: function () {
            this.addItem({
                type: "folder",
                name: "Hintergrundkarten",
                glyphicon: "glyphicon-plus-sign",
                id: "Baselayer",
                parentId: "themen"
            });
            this.addItem({
                type: "folder",
                name: "Fachdaten",
                glyphicon: "glyphicon-plus-sign",
                id: "Overlayer",
                parentId: "themen"
            });
            this.addItem({
                type: "folder",
                name: "Auswahl der Themen",
                glyphicon: "glyphicon-plus-sign",
                id: "SelectedLayer",
                parentId: "themen",
                isLeafFolder: true
            });
        },

        /**
         * Gruppiert Objekte aus der layerlist, die mit den Ids in der übergebenen Liste übereinstimmen
         * @param  {Object[]} layerlist - Objekte aus der services.json
         * @param  {string[]} ids - Array von Ids deren Objekte gruppiert werden
         * @return {Object[]} layerlist - Objekte aus der services.json
         */
        mergeLayersByIds: function (ids, layerlist) {
            var objectsByIds,
                newObject;

                // Objekte die gruppiert werden
                objectsByIds = _.filter(layerlist, function (object) {
                    return _.contains(ids, object.id);
                });
                // Das erste Objekt wird kopiert
                newObject = _.clone(objectsByIds[0]);
                // Das Attribut layers wird gruppiert und am kopierten Objekt gesetzt
                newObject.layers = _.pluck(objectsByIds, "layers").toString();
                // Das Attribut maxScale wird gruppiert
                // Am kopierten Objekt wird der höchste Wert gesetzt
                newObject.maxScale = _.max(_.pluck(objectsByIds, "maxScale"), function (scale) {
                    return parseInt(scale, 10);
                });
                // Das Attribut minScale wird gruppiert
                // Am kopierten Objekt wird der niedrigste Wert gesetzt
                newObject.minScale = _.min(_.pluck(objectsByIds, "minScale"), function (scale) {
                    return parseInt(scale, 10);
                });

            return newObject;
        }
    });

    return Parser;
});
