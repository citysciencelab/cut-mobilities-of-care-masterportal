import Backbone from "backbone";
import ModelList from "../modelList/list";

const Parser = Backbone.Model.extend({
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
        onlyDesktopTools: [
            "measure",
            "print",
            "kmlimport",
            "draw",
            "featureLister",
            "animation",
            "addWMS"
        ]
    },

    initialize: function () {

        var channel = Radio.channel("Parser");

        channel.reply({
            "getItemByAttributes": this.getItemByAttributes,
            "getItemsByAttributes": this.getItemsByAttributes,
            "getTreeType": function () {
                return this.get("treeType");
            },
            "getCategory": function () {
                return this.get("category");
            },
            "getCategories": function () {
                return this.get("categories");
            },
            "getPortalConfig": function () {
                return this.get("portalConfig");
            },
            "getItemsByMetaID": this.getItemsByMetaID,
            "getSnippetInfos": function () {
                return this.get("snippetInfos");
            },
            "getInitVisibBaselayer": this.getInitVisibBaselayer
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
        this.parseMenu(this.get("portalConfig").menu, "root");
        this.parseControls(this.get("portalConfig").controls);
        this.parseSearchBar(this.get("portalConfig").searchBar);
        this.parseMapView(this.get("portalConfig").mapView);

        if (this.get("treeType") === "light") {
            this.parseTree(this.get("overlayer"), "tree", 0);
            this.parseTree(this.get("baselayer"), "tree", 0);
        }
        else if (this.get("treeType") === "custom") {
            this.addTreeMenuItems();
            this.parseTree(this.get("baselayer"), "Baselayer", 0);
            this.parseTree(this.get("overlayer"), "Overlayer", 0);
        }
        else {
            this.addTreeMenuItems();
            this.parseTree(Radio.request("RawLayerList", "getLayerAttributesList"));
        }
        this.createModelList();
    },

    /**
     * Parsed die Menüeinträge (alles außer dem Inhalt des Baumes)
     * @param {object} items Einzelnen Ebenen der Menüleiste, bsp. contact, legend, tools und tree
     * @param {string} parentId gibt an wem die items hinzugefügt werden
     * @return {undefined}
     */
    parseMenu: function (items, parentId) {
        _.each(items, function (value, key) {
            var item,
                toolitem;

            if (_.has(value, "children") || key === "tree") {
                item = {
                    type: "folder",
                    parentId: parentId,
                    id: key,
                    treeType: this.get("treeType")
                };

                // Attribute aus der config.json werden von item geerbt
                _.extend(item, value);
                this.addItem(item);
                this.parseMenu(value.children, key);
            }
            else if (key.search("staticlinks") !== -1) {
                _.each(value, function (staticlink) {
                    toolitem = _.extend(staticlink, {type: "staticlink", parentId: parentId, id: _.uniqueId(key + "_")});

                    this.addItem(toolitem);
                }, this);
            }
            else {
                toolitem = _.extend(value, {type: "tool", parentId: parentId, id: key});

                // wenn tool noch kein "onlyDesktop" aus der Config bekommen hat
                if (!_.has(toolitem, "onlyDesktop")) {
                    // wenn tool in onlyDesktopTools enthalten ist, setze onlyDesktop auf true
                    if (_.indexOf(this.get("onlyDesktopTools"), toolitem.id) !== -1) {
                        toolitem = _.extend(toolitem, {onlyDesktop: true});
                    }
                }
                this.addItem(toolitem);
            }
        }, this);
    },

    /**
     * [parseSearchBar description]
     * @param  {[type]} searchbarConfig [description]
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
     * @param {object} obj - Item
     * @return {undefined}
     */
    addItem: function (obj) {
        if (!_.isUndefined(obj.visibility)) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").push(obj);
    },

    /**
     *  Ermöglicht ein Array von Objekten, die alle attr gemeinsam haben zu erzeugen
     *  @param {array} objs Array von zusammengehörenden Objekten, bsp. Kategorien im Themenbaum
     *  @param {object} attr Layerobjekt
     *  @return {undefined}
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
            maxScale: "2500000",
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
     * @return {undefined}
     */
    addItemAtTop: function (obj) {
        if (!_.isUndefined(obj.visibility)) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").unshift(obj);
    },

    // Setter für Attribut "itemList"
    setItemList: function (value) {
        this.set("itemList", value);
    },

    // setter für Attribut "baselayer"
    setBaselayer: function (value) {
        this.set("baselayer", value);
    },

    // Setter für Attribut "overlayer"
    setOverlayer: function (value) {
        this.set("overlayer", value);
    },

    // Setter für Attribut "treeType"
    setTreeType: function (value) {
        this.set("treeType", value);
    },

    // Setter für Attribut "category"
    setCategory: function (value) {
        this.set("category", value);
    },

    /**
     * [getItemByAttributes description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    getItemByAttributes: function (value) {
        return _.findWhere(this.get("itemList"), value);
    },

    /**
     * [getItemsByAttributes description]
     * @param  {[type]} value [description]
     * @return {[type]}       [description]
     */
    getItemsByAttributes: function (value) {
        return _.where(this.get("itemList"), value);
    },

    /**
     * [createModelList description]
     * @return {[type]} [description]
     */
    createModelList: function () {
        new ModelList(_.filter(this.get("itemList"), function (model) {
            return model.parentId === "root" ||
                model.parentId === "tools" ||
                model.parentId === "info" ||
                model.parentId === "bezirke";
        }));
    },

    addTreeMenuItems: function () {
        var menu = _.has(this.get("portalConfig"), "menu") ? this.get("portalConfig").menu : undefined,
            tree = !_.isUndefined(menu) && _.has(menu, "tree") ? menu.tree : undefined,
            isAlwaysExpandedList = !_.isUndefined(tree) && _.has(tree, "isAlwaysExpanded") ? tree.isAlwaysExpanded : [];

        this.addItem({
            type: "folder",
            name: "Hintergrundkarten",
            glyphicon: "glyphicon-plus-sign",
            id: "Baselayer",
            parentId: "tree",
            isInThemen: true,
            isInitiallyExpanded: false,
            isAlwaysExpanded: _.contains(isAlwaysExpandedList, "Baselayer"),
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
            isAlwaysExpanded: _.contains(isAlwaysExpandedList, "Overlayer"),
            level: 0
        });
        this.addItem({
            type: "folder",
            name: "Ausgewählte Themen",
            glyphicon: "glyphicon-plus-sign",
            id: "SelectedLayer",
            parentId: "tree",
            isLeafFolder: true,
            isInThemen: true,
            isInitiallyExpanded: true,
            isAlwaysExpanded: _.contains(isAlwaysExpandedList, "SelectedLayer"),
            level: 0
        });
    },

    /**
     * Gruppiert Objekte aus der layerlist, die mit den Ids in der übergebenen Liste übereinstimmen
     * @param  {string[]} ids - Array von Ids deren Objekte gruppiert werden
     * @param  {Object[]} layerlist - Objekte aus der services.json
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
        var trimmedValue = value.replace(/[^a-zA-Z0-9]/g, "");

        return _.uniqueId(trimmedValue);
    },

    getItemsByMetaID: function (metaID) {
        var layers = _.filter(this.get("itemList"), function (item) {
            if (item.type === "layer") {
                if (item.datasets.length > 0) {
                    return item.datasets[0].md_id === metaID;
                }
            }
            return false;
        }, this);

        return layers;
    },

    /**
     * Gibt den initial sichtbaren Baselayer aus der config.json zurück
     * bei Array mehrer id wird nur die erste übergeben
     * @return {String} layer - inital sichtbarer Baselayer
     */
    getInitVisibBaselayer: function () {
        var layer = _.findWhere(this.get("baselayer").Layer, {visibility: true});

        if (_.isArray(layer.id)) {
            layer.id = layer.id[0];
        }
        return layer;
    }
});

export default Parser;
