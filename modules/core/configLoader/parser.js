define([
    "backbone",
    "backbone.radio",
    "modules/core/modelList/list"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        ModelList = require("modules/core/modelList/list"),
        Parser;

    Parser = Backbone.Model.extend({
        defaults: {
            // "light-models"
            itemList: [],
            // Themenconfig.Fachdaten
            overlayer: [],
            // Themenconfig.Hintergrundkarten
            baselayer: [],
            // Portalconfig
            portalConfig: {},
            // Baumtyp
            treeType: "",
            // Fachdaten Kategorien für DefaultTree
            categories: ["Opendata", "Inspire", "Behörde"],
            // Aktuelle Kategorie
            category: "Opendata",
            // Nur für Lighttree: Index der zuletzt eingefügten Layer,
            // wird für die Sortierung/das Verschieben benötigt
            selectionIDX: -1
        },

        initialize: function () {
            var channel = Radio.channel("Parser");

            channel.reply({
                "getItemByAttributes": this.getItemByAttributes,
                "getItemsByAttributes": this.getItemsByAttributes,
                "getTreeType": this.getTreeType,
                "getCategory": this.getCategory,
                "getCategories": this.getCategories,
                "getPortalConfig": this.getPortalConfig,
                "getItemsByMetaID": this.getItemsByMetaID
            }, this);

            channel.on({
                "setCategory": this.setCategory,
                "addItem": this.addItem,
                "addItems": this.addItems,
                "addFolder": this.addFolder,
                "addLayer": this.addLayer,
                "addGeoJSONLayer": this.addGeoJSONLayer
            }, this);

            this.listenTo(this, {
                "change:category": function () {
                    var modelList = Radio.request("ModelList", "getCollection"),
                        modelListToRemove = modelList.filter(function (model) {
                            // Alle Fachdaten Layer
                            return model.get("type") === "layer" && model.get("parentId") !== "Baselayer";
                        });

                    _.each(modelListToRemove, function (model) {
                        model.setIsSelected(false);
                    });
                    modelList.remove(modelListToRemove);
                    this.setItemList([]);
                    this.addTreeMenuItems();
                    this.parseTree(Radio.request("RawLayerList", "getLayerAttributesList"));
                    Radio.trigger("ModelList", "removeModelsByParentId", "Themen");
                    Radio.trigger("ModelList", "renderTree");
                    Radio.trigger("ModelList", "setModelAttributesById", "Overlayer", {isExpanded: true});
                }
            });
            this.parseMenu(this.getPortalConfig().menu, "root");
            this.parseControls(this.getPortalConfig().controls);
            this.parseSearchBar(this.getPortalConfig().searchBar);
            this.parseMapView(this.getPortalConfig().mapView);

            if (this.getTreeType() === "light") {
                this.parseTree(this.getOverlayer(), "Themen", 0);
                this.parseTree(this.getBaselayer(), "Themen", 0);
            }
            else if (this.getTreeType() === "custom") {
                this.addTreeMenuItems();
                this.parseTree(this.getBaselayer(), "Baselayer", 0);
                this.parseTree(this.getOverlayer(), "Overlayer", 0);
            }
            else {
                this.addTreeMenuItems();
                this.parseTree(Radio.request("RawLayerList", "getLayerAttributesList"));
            }
            this.createModelList();
        },

        getPortalConfig: function () {
            return this.get("portalConfig");
        },

        /**
         * Parsed die Menüeinträge (alles außer dem Inhalt des Baumes)
         */
        parseMenu: function (items, parentId) {

            _.each(items, function (value, key) {
                if (_.has(value, "children") || key === "tree") {
                    var item = {
                        type: "folder",
                        parentId: parentId,
                        id: value.name,
                        treeType: this.getTreeType()
                    };

                    // Attribute aus der config.json werden von item geerbt
                    _.extend(item, value);
                    // folder Themen bekommt noch den Baumtyp als Attribut
                    if (value.name === "Themen") {
                        this.addItem(_.extend(item, {treeType: this.getTreeType()}));
                    }
                    else {
                        this.addItem(item);
                    }
                    this.parseMenu(value.children, value.name);
                }
                else {
                    var toolitem = _.extend(value, {type: "tool", parentId: parentId, id: key});

                    if (toolitem.id === "measure" || toolitem.id === "draw") {
                        if (!Radio.request("Util", "isApple") && !Radio.request("Util", "isAndroid")) {
                             this.addItem(toolitem);
                         }
                    }
                    else {
                        this.addItem(toolitem);
                    }
                }
            }, this);
        },

        /**
         * [parseSearchBar description]
         * @param  {[type]} items [description]
         * @return {[type]}       [description]
         */
        parseSearchBar: function (searchbarConfig) {
            this.addItem({
                type: "searchBar",
                attr: searchbarConfig
            });
        },

         /** [parseMapView description]
         * @param  {[type]} items [description]
         * @return {[type]}       [description]
         */
        parseMapView: function (items) {
            _.each(items, function (value, key) {
                this.addItem({
                    type: "mapView",
                    id: key,
                    attr: value
                });
            }, this);
        },

        /**
         * [parseControls description]
         * @param  {[type]} items [description]
         * @return {[type]}       [description]
         */
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

        addFolder: function (name, id, parentId, level) {
            var folder = {
                type: "folder",
                name: name,
                glyphicon: "glyphicon-plus-sign",
                id: id,
                parentId: parentId,
                isExpanded: false,
                level: level
            };

            this.addItem(folder);
        },

        addLayer: function (name, id, parentId, level, layers, url, version) {
            console.log(name);
            var layer = {
                type: "layer",
                name: name,
                id: id,
                parentId: parentId,
                level: level,
                url: url,
                typ: "WMS",
                layers: layers,
                format: "image/png",
                version: version,
                singleTile: false,
                transparent: true,
                tilesize: "512",
                gutter: "0",
                featureCount: 3,
                minScale: "0",
                maxScale: "350000",
                gfiAttributes: "showAll",
                layerAttribution: "nicht vorhanden",
                legendURL: "",
                isbaselayer: false,
                cache: false,
                datasets: []
            };

            this.addItem(layer);
        },

        addGeoJSONLayer: function (name, id, features) {
            var layer = {
                type: "layer",
                name: name,
                id: id,
                typ: "GeoJSON",
                features: features,
                transparent: true,
                minScale: "0",
                maxScale: "350000",
                gfiAttributes: "showAll",
                layerAttribution: "nicht vorhanden",
                legendURL: "",
                isbaselayer: false,
                cache: false,
                datasets: []
            };

            this.addItem(layer);
        },

        /**
         * Setter für Attribut "itemList"
         */
        setItemList: function (value) {
            this.set("itemList", value);
        },

        /**
         * Getter für das Attribut "itemList"
         * @return {Array}
         */
        getItemList: function () {
            return this.get("itemList");
        },

        /**
         * Getter für Attribut "baselayer"
         * @return {Object}
         */
        getBaselayer: function () {
            return this.get("baselayer");
        },
        /**
         * setter für Attribut "baselayer"
         * @return {Object}
         */
        setBaselayer: function (value) {
            return this.set("baselayer", value);
        },

         /**
          * Getter für Attribut "overlayer"
          * @return {Object}
          */
        getOverlayer: function () {
            return this.get("overlayer");
        },
         /**
          * Setter für Attribut "overlayer"
          * @return {Object}
          */
        setOverlayer: function (value) {
            return this.set("overlayer", value);
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
          * Getter für Attribut "category"
          * @return {String}
          */
        getCategory: function () {
             return this.get("category");
        },

        /**
          * Getter für Attribut "categories"
          * @return {String[]}
          */
        getCategories: function () {
            return this.get("categories");
        },

        /**
          * Getter für Attribut "category"
          * @return {String}
          */
        setCategory: function (value) {
             return this.set("category", value);
        },

        /**
         * [getItemByAttributes description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        getItemByAttributes: function (value) {
            return _.findWhere(this.getItemList(), value);
        },

        /**
         * [getItemsByAttributes description]
         * @param  {[type]} value [description]
         * @return {[type]}       [description]
         */
        getItemsByAttributes: function (value) {
            return _.where(this.getItemList(), value);
        },

        /**
         * [createModelList description]
         * @return {[type]} [description]
         */
        createModelList: function () {
            new ModelList(_.filter(this.getItemList(), function (model) {
                return model.parentId === "root" ||
                    model.parentId === "Werkzeuge" || model.parentId === "Info";
            }));
        },

        addTreeMenuItems: function () {
            this.addItem({
                type: "folder",
                name: "Hintergrundkarten",
                glyphicon: "glyphicon-plus-sign",
                id: "Baselayer",
                parentId: "Themen",
                isInThemen: true,
                isInitiallyExpanded: false,
                level: 0
            });
            this.addItem({
                type: "folder",
                name: "Fachdaten",
                glyphicon: "glyphicon-plus-sign",
                id: "Overlayer",
                parentId: "Themen",
                isInThemen: true,
                isInitiallyExpanded: false,
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
                isInitiallyExpanded: true,
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
            var objectsByIds = [],
                newObject;
                // Objekte die gruppiert werden
                _.each(ids, function (id) {
                    objectsByIds.push(_.findWhere(layerlist, {id: id}));
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
        },

        getItemsByMetaID: function (metaID) {
            var layers = _.filter(this.getItemList(), function (item) {
                if (item.type === "layer") {
                    if (item.datasets.length > 0) {
                        return item.datasets[0].md_id === metaID;
                    }
                }
            }, this);

            return layers;
        }
    });

    return Parser;
});
