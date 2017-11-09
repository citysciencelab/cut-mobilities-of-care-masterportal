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
            selectionIDX: -1,
            onlyDesktopTools: ["measure", "print", "kmlimport", "draw", "featureLister", "animation", "addWMS"]
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
                "getItemsByMetaID": this.getItemsByMetaID,
                "getSnippetInfos": function () {
                    return this.get("snippetInfos");
                },
                "getInitVisibBaselayer" : this.getInitVisibBaselayer
            }, this);

            channel.on({
                "setCategory": this.setCategory,
                "addItem": this.addItem,
                "addItemAtTop": this.addItemAtTop,
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
                    Radio.trigger("ModelList", "removeModelsByParentId", "tree");
                    Radio.trigger("ModelList", "renderTree");
                    Radio.trigger("ModelList", "setModelAttributesById", "Overlayer", {isExpanded: true});
                }
            });
            this.parseMenu(this.getPortalConfig().menu, "root");
            this.parseControls(this.getPortalConfig().controls);
            this.parseSearchBar(this.getPortalConfig().searchBar);
            this.parseMapView(this.getPortalConfig().mapView);

            if (this.getTreeType() === "light") {
                this.parseTree(this.getOverlayer(), "tree", 0);
                this.parseTree(this.getBaselayer(), "tree", 0);
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
                        id: key,
                        treeType: this.getTreeType()
                    };

                    // Attribute aus der config.json werden von item geerbt
                    _.extend(item, value);
                    // folder Themen bekommt noch den Baumtyp als Attribut
                    if (key === "tree") {
                        this.addItem(_.extend(item, {treeType: this.getTreeType()}));
                    }
                    else {
                        this.addItem(item);
                    }
                    this.parseMenu(value.children, key);
                }
                else {
                    if (key.search("staticlinks") !== -1) {
                        _.each(value, function (staticlink) {
                            var toolitem = _.extend(staticlink, {type: "staticlink", parentId: parentId, id: _.uniqueId(key + "_")});

                            this.addItem(toolitem);
                        }, this);
                    }
                    else {
                        var toolitem = _.extend(value, {type: "tool", parentId: parentId, id: key});

                        // wenn tool noch kein "onlyDesktop" aus der Config bekommen hat
                        if (!_.has(toolitem, "onlyDesktop")) {
                            // wenn tool in onlyDesktopTools enthalten ist, setze onlyDesktop auf true
                            if (_.indexOf(this.get("onlyDesktopTools"), toolitem.id) !== -1) {
                                toolitem = _.extend(toolitem, {onlyDesktop: true});
                            }
                        }
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
         * Fügt dem Attribut "itemList" ein Item(layer, folder, ...) am Ende hinzu
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

        addGeoJSONLayer: function (name, id, geojson) {
            var layer = {
                type: "layer",
                name: name,
                id: id,
                typ: "GeoJSON",
                geojson: geojson,
                transparent: true,
                minScale: "0",
                maxScale: "350000",
                gfiAttributes: "showAll",
                layerAttribution: "nicht vorhanden",
                legendURL: "",
                isbaselayer: false,
                isSelected: true,
                isVisibleInTree: true,
                cache: false,
                datasets: []
            };

            this.addItem(layer);
        },

        /**
         * Fügt dem Attribut "itemList" ein Item(layer, folder, ...) am Beginn hinzu
         * @param {Object} obj - Item
         */
        addItemAtTop: function (obj) {
            if (!_.isUndefined(obj.visibility)) {
                obj.isSelected = obj.visibility;
                obj.isVisibleInMap = obj.visibility;
                delete obj.visibility;
            }
            this.getItemList().unshift(obj);
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
                    model.parentId === "tools" ||
                    model.parentId === "info" ||
                    model.parentId === "bezirke";
            }));
        },

        addTreeMenuItems: function () {
            this.addItem({
                type: "folder",
                name: "Hintergrundkarten",
                glyphicon: "glyphicon-plus-sign",
                id: "Baselayer",
                parentId: "tree",
                isInThemen: true,
                isInitiallyExpanded: false,
                level: 0
            });
            this.addItem({
                type: "folder",
                name: "Fachdaten",
                glyphicon: "glyphicon-plus-sign",
                id: "Overlayer",
                parentId: "tree",
                isInThemen: true,
                isInitiallyExpanded: false,
                level: 0
            });
            this.addItem({
                type: "folder",
                name: "Auswahl der Themen",
                glyphicon: "glyphicon-plus-sign",
                id: "SelectedLayer",
                parentId: "tree",
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
                var lay = _.findWhere(layerlist, {id: id});

                if (lay) {
                    objectsByIds.push(lay);
                }
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
        },

        /**
         * Gibt den initial sichtbaren Baselayer aus der config.json zurück
         * bei Array mehrer id wird nur die erste übergeben
         * @return {String} layer - inital sichtbarer Baselayer
         */
        getInitVisibBaselayer: function () {
            var layer = _.findWhere(this.getBaselayer().Layer, {visibility: true});

            if (_.isArray(layer.id)) {
                layer.id = layer.id[0];
            };
            return layer
        }
    });

    return Parser;
});
