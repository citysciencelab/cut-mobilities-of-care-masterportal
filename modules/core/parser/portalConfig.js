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
            portalConfig: {},
            // Baumtyp
            treeType: ""
        },
        // Pfad zur config
        url: "config.json",
        initialize: function (response) {
            var channel = Radio.channel("Parser");
            this.setPortalConfig(response.Themenconfig.Portalconfig);
            this.setBaselayer(response.Themenconfig.Hintergrundkarten);
            this.setOverlayer(response.Themenconfig.Fachdaten);
            this.setTreeType(response.Portalconfig.Baumtyp);
            if (this.getTreeType() !== "lighttree") {
                this.addTreeMenuItems();
            }
            this.parseMenu(response.Portalconfig.menu, "root");
            channel.reply({
                "getPortalConfig": this.getPortalConfig,
                "getItemsByParentId": this.getItemsByParentId,
                "getItemByAttributes": function (attributes) {
                    return _.findWhere(this.getItemList(), attributes);
                },
                "getItemsByAttributes": function (attributes) {
                    return _.where(this.getItemList(), attributes);
                }
            }, this);
        },
        /**
         * Parsed die Menüeinträge (alles außer dem Inhalt des Baumes)
         */
        parseMenu: function (items, parentId) {

            _.each(items, function (value, key) {
                if (_.has(value, "children") || key === "tree") {
                    this.addItem({
                        type: "folder",
                        parentId: parentId,
                        glyphicon: value.glyphicon,
                        name: value.name,
                        id: value.name
                    });
                    this.parseMenu(value.children, value.name);
                }
                else {
                    this.addItem(_.extend({type: "tool", parentId: parentId, id: key}, value));
                }
            }, this);
        },

        parseControls: function (items) {
            _.each(items, function (value, key) {
                this.addItem({
                    type: "control",
                    id: key,
                    attr: value
                });
            }, this);
        },

        /**
         * Fügt dem Attribut "itemList" ein Item(layer, folder, ...) hinzu
         * @param {Object} obj - Item
         */
        addItem: function (obj) {
            if (!_.isUndefined(obj.visibility)) {
                obj.isSelected = obj.visibility;
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
         * setter für Attribut "Hintergrundkarten"
         * @return {Object}
         */
        setBaselayer: function (value) {
            return this.set("Hintergrundkarten", value);
        },

         /**
          * Getter für Attribut "Fachdaten"
          * @return {Object}
          */
        getOverlayer: function () {
            return this.get("Fachdaten");
        },
         /**
          * Setter für Attribut "Fachdaten"
          * @return {Object}
          */
        setOverlayer: function (value) {
            return this.set("Fachdaten", value);
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
          * Getter für Attribut "treeType"
          * @return {String}
          */
        getTreeType: function () {
             return this.get("treeType");
        },
        /**
          * Getter für Attribut "treeType"
          * @return {String}
          */
        setTreeType: function (value) {
             return this.set("treeType", value);
        },
        /**
         * [createModelList description]
         * @return {[type]} [description]
         */
        createModelList: function () {
            new ModelList(_.filter(this.getItemList(), function (model) {
                return model.parentId === "root" ||
                    model.parentId === "Werkzeuge" ||
                    model.parentId === "Themen";
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
                parentId: "Themen",
                isInThemen: true,
                isExpanded: false,
                level: 0
            });
            this.addItem({
                type: "folder",
                name: "Fachdaten",
                glyphicon: "glyphicon-plus-sign",
                id: "Overlayer",
                parentId: "Themen",
                isInThemen: true,
                isExpanded: true,
                level: 0
            });
            this.addItem({
                type: "folder",
                name: "Auswahl der Themen",
                glyphicon: "glyphicon-plus-sign",
                id: "SelectedLayer",
                parentId: "Themen",
                isLeafFolder: true,
                isInThemen: true,
                isExpanded: false,
                level: 0
            });
        },

        /**
         * Gruppiert Objekte aus der layerlist, die mit den Ids in der übergebenen Liste übereinstimmen
         * @param  {Object[]} layerlist - Objekte aus der services.json
         * @param  {string[]} ids - Array von Ids deren Objekte gruppiert werden
         * @return {Object[]} layerlist - Objekte aus der services.json
         */
        mergeObjectsByIds: function (ids, layerlist) {
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
        },

        /**
         * Generiert eine Uniq-Id mit Prefix
         * Zuvor werden alle Leerzeichen aus dem Prefix entfernt
         * @param  {String} value - Prefix für Uniq-Id
         * @return {String} value - Uniq-Id
         */
        createUniqId: function (value) {
            value = value.replace(/[^a-zA-Z0-9]/g, "");

            return _.uniqueId(value);
        }
    });

    return Parser;
});
