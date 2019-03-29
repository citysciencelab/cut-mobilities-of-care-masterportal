import Backbone from "backbone";
import ModelList from "../modelList/list";

const Parser = Backbone.Model.extend(/** @lends Parser.prototype */{
    defaults: {
        itemList: [],
        overlayer: [],
        baselayer: [],
        portalConfig: {},
        treeType: "",
        categories: ["Opendata", "Inspire", "Behörde"],
        category: "Opendata",
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

    /**
     * @class Parser
     * @description Parse the configured models from config datas
     * Models can be of type folder, layer, staticlink, tool, viewpoint, ...
     * @extends Backbone.Model
     * @memberOf Core.configLoader
     * @constructs
     * @property {Array} itemList=[] lightModels
     * @property {Array} overlayer=[] Themenconfig.Fachdaten
     * @property {Array} baselayer=[] Themenconfig.Hintergrundkarten
     * @property {Object} portalConfig={} Portalconfig
     * @property {String} treeType="" the attribute Baumtyp
     * @property {String[]} categories=["Opendata", "Inspire", "Behörde"] categories for Fachdaten in DefaultTree
     * @property {String} category="Opendata" selected category for Fachdaten in DefaultTree
     * @property {Number} selectionIDX=-1 Index of the last inserted layers. Required for sorting/moving (only for the treeType lightTree)
     * @property {String[]} onlyDesktopTools=["measure", "print", "kmlimport", "draw", "featureLister", "animation", "addWMS"]
     * @listens Parser#RadioRequestParserGetItemByAttributes
     * @listens Parser#RadioRequestParserGetItemsByAttributes
     * @listens Parser#RadioRequestParserGetTreeType
     * @listens Parser#RadioRequestParserGetCategory
     * @listens Parser#RadioRequestParserGetCategories
     * @listens Parser#RadioRequestParserGetPortalConfig
     * @listens Parser#RadioRequestParserGetItemsByMetaID
     * @listens Parser#RadioRequestParserGetSnippetInfos
     * @listens Parser#RadioRequestParserGetInitVisibBaselayer
     * @listens Parser#RadioTriggerParsersetCategory
     * @listens Parser#RadioTriggerParserAddItem
     * @listens Parser#RadioTriggerParserAddItemAtTop
     * @listens Parser#RadioTriggerParserAddItems
     * @listens Parser#RadioTriggerParserAddFolder
     * @listens Parser#RadioTriggerParserAddLayer
     * @listens Parser#RadioTriggerParserAddGDILayer
     * @listens Parser#RadioTriggerParserAddGeoJSONLayer
     * @listens Parser#RadioTriggerParserRemoveItem
     * @listens Parser#ChangeCategory
     * @fires Parser#RadioTriggerModelListRemoveModelsByParentId
     * @fires Parser#RadioTriggerModelListRenderTree
     * @fires Parser#RadioTriggerModelListSetModelAttributesById
     * @fires Parser#RadioTriggerModelListRemoveModelsById
     */
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
            "addGDILayer": this.addGDILayer,
            "addGeoJSONLayer": this.addGeoJSONLayer,
            "removeItem": this.removeItem
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

        this.listenTo(Radio.channel("Util"), {
            "isViewMobileChanged": function (isViewMobile) {
                this.addOrRemove3DFolder(this.get("treeType"), isViewMobile, this.get("overlayer_3d"));
            }
        });

        this.parseMenu(this.get("portalConfig").menu, "root");
        this.parseControls(this.get("portalConfig").controls);
        this.parseSearchBar(this.get("portalConfig").searchBar);

        if (this.get("treeType") === "light") {
            this.parseTree(this.get("overlayer"), "tree", 0);
            this.parseTree(this.get("baselayer"), "tree", 0);
        }
        else if (this.get("treeType") === "custom") {
            this.addTreeMenuItems("custom", this.get("overlayer_3d"));
            this.parseTree(this.get("baselayer"), "Baselayer", 0);
            this.parseTree(this.get("overlayer"), "Overlayer", 0);
            this.parseTree(this.get("overlayer_3d"), "3d_daten", 0);
        }
        else {
            this.addTreeMenuItems(this.get("treeType"));
            this.parseTree(Radio.request("RawLayerList", "getLayerAttributesList"));
        }
        this.createModelList();
    },

    /**
     * Parsed the menu entries (everything except the contents of the tree)
     * @param {Object} items Single levels of the menu bar, e.g. contact, legend, tools and tree
     * @param {String} parentId indicates to whom the items will be added
     * @return {void}
     */
    parseMenu: function (items, parentId) {
        _.each(items, function (value, key) {
            var item,
                toolitem,
                ansicht,
                downloadItem;

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
            else if (_.has(value, "type") && value.type === "viewpoint") {
                ansicht = _.extend(value, {parentId: parentId, id: _.uniqueId(key + "_")});
                this.addItem(ansicht);
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

                // special case because the download tool is only used in Drawtool
                if (toolitem.id === "draw") {
                    downloadItem = {
                        parentId: parentId,
                        type: "tool",
                        id: "download",
                        isVisibleInMenu: false
                    };

                    this.addItem(downloadItem);
                }
                this.addItem(toolitem);
            }
        }, this);
    },

    /**
     * @todo
     * @param  {Object} searchbarConfig - todo
     * @return {void}
     */
    parseSearchBar: function (searchbarConfig) {
        this.addItem({
            type: "searchBar",
            attr: searchbarConfig
        });
    },

    /**
     * @todo
     * @param  {Array} items - todo
     * @return {void}
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
     * Adds an item(layer, folder, ...) to the end of the attribute "itemList".
     * @param {Object} obj - Item
     * @return {void}
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
     * Adds an item(layer, folder, ...) to the attribute "itemList" at the specified position.
     * @param {Object} obj - Item
     * @param {Number} position - position in ItemList
     * @return {void}
     */
    addItemByPosition: function (obj, position) {
        if (!_.isUndefined(obj.visibility)) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").splice(position, 0, obj);
    },

    /**
     *  Allows to create an array of objects that all have attr in common
     *  @param {array} objs Array of related objects, e.g. categories in Themenbaum
     *  @param {object} attr Layerobject
     *  @return {void}
     */
    addItems: function (objs, attr) {
        _.each(objs, function (obj) {
            this.addItem(_.extend(obj, attr));
        }, this);
    },

    /**
     * @todo
     * @param {*} name - todo
     * @param {*} id - todo
     * @param {*} parentId - todo
     * @param {*} level - todo
     * @param {*} isExpanded - todo
     * @returns {void}
     */
    addFolder: function (name, id, parentId, level, isExpanded) {
        var folder = {
            type: "folder",
            name: name,
            glyphicon: "glyphicon-plus-sign",
            id: id,
            parentId: parentId,
            isExpanded: isExpanded ? isExpanded : false,
            level: level
        };

        this.addItem(folder);
    },

    /**
     * @todo
     * @param {*} name - todo
     * @param {*} id - todo
     * @param {*} parentId - todo
     * @param {*} level - todo
     * @param {*} layers - todo
     * @param {*} url - todo
     * @param {*} version - todo
     * @returns {void}
     */
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
            supported: ["2D", "3D"],
            legendURL: "",
            isbaselayer: false,
            cache: false,
            datasets: []
        };

        this.addItem(layer);
    },

    /**
     * @todo
     * @param {*} name - todo
     * @param {*} id - todo
     * @param {*} geojson - todo
     * @returns {void}
     */
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
     * adds a layer from the elastic serach gdi search
     * @param {Object} values - includes {name, id, parentId, level, layers, url, version, gfiAttributes, datasets, isJustAdded}
     * @returns {void}
     */
    addGDILayer: function (values) {
        var layer = {
            type: "layer",
            name: values.name,
            id: values.id,
            parentId: values.parentId,
            level: values.level,
            url: values.url,
            typ: "WMS",
            layers: values.layers,
            format: "image/png",
            version: values.version,
            singleTile: false,
            transparent: true,
            transparency: 0,
            tilesize: "512",
            gutter: "0",
            featureCount: "3",
            minScale: "0",
            maxScale: "2500000",
            gfiAttributes: values.gfiAttributes,
            layerAttribution: "nicht vorhanden",
            legendURL: "",
            cache: false,
            isSelected: true,
            isVisibleInTree: true,
            isChildLayer: false,
            datasets: values.datasets,
            isJustAdded: values.isJustAdded
        };

        this.addItemAtTop(layer);
    },

    /**
     * Adds an item(layer, folder, ...) at the beginning to the attribute "itemList
     * @param {Object} obj - Item
     * @return {void}
     */
    addItemAtTop: function (obj) {
        if (!_.isUndefined(obj.visibility)) {
            obj.isSelected = obj.visibility;
            obj.isVisibleInMap = obj.visibility;
            delete obj.visibility;
        }
        this.get("itemList").unshift(obj);
    },

    /**
     * get an item from itemList by a given value
     * @param  {Object} value - todo
     * @return {Object} item
     */
    getItemByAttributes: function (value) {
        return _.findWhere(this.get("itemList"), value);
    },

    /**
     * get one ore more item from itemList by a given value
     * @param  {Object} value - t odo
     * @return {Array} Items
     */
    getItemsByAttributes: function (value) {
        return _.where(this.get("itemList"), value);
    },

    /**
     * removes an item from itemList by a given id
     * @param {String} id - id from item that be removed
     * @returns {void}
     */
    removeItem: function (id) {
        var itemList = this.get("itemList").filter(function (item) {
            return item.id !== id;
        });

        this.setItemList(itemList);
    },

    /**
     * @todo
     * @return {ModelList} todo
     */
    createModelList: function () {
        new ModelList(this.get("itemList").filter(function (model) {
            return model.parentId === "root" ||
                model.parentId === "tools" ||
                model.parentId === "info" ||
                model.parentId === "bezirke" ||
                model.parentId === "3d_daten" ||
                model.parentId === "ansichten";
        }));
    },

    /**
     * regulates the folder structure of the theme tree taking into account the map mode
     * @param {String} treeType - type of topic tree
     * @returns {void}
     */
    addTreeMenuItems: function (treeType) {
        var menu = _.has(this.get("portalConfig"), "menu") ? this.get("portalConfig").menu : undefined,
            tree = !_.isUndefined(menu) && _.has(menu, "tree") ? menu.tree : undefined,
            isAlwaysExpandedList = !_.isUndefined(tree) && _.has(tree, "isAlwaysExpanded") ? tree.isAlwaysExpanded : [],
            isMobile = Radio.request("Util", "isViewMobile"),
            overLayer3d = this.get("overlayer_3d");

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

        this.addOrRemove3DFolder(treeType, isMobile, overLayer3d);

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
     * adds or removes a folder for 3d data to topic tree considering the map mode
     * @param {String} treeType - type of tree
     * @param {boolean} isMobile - vsible map mode from portal
     * @param {object} overLayer3d - contains layer fro 3d mode
     * @fires Parser#RadioTriggerModelListRemoveModelsById
     * @returns {void}
     */
    addOrRemove3DFolder: function (treeType, isMobile, overLayer3d) {
        var id3d = "3d_daten";

        if (!isMobile && (treeType === "default" || !_.isUndefined(overLayer3d))) {
            this.addItemByPosition({
                type: "folder",
                name: "3D Daten",
                id: id3d,
                parentId: "tree",
                isInThemen: true,
                isInitiallyExpanded: false,
                level: 0
            }, this.postionFor3DFolder(this.get("itemList")));
        }
        else {
            this.removeItem(id3d);
            Radio.trigger("ModelList", "removeModelsById", id3d);
        }
    },

    /**
     * get the position where the 3d folder has to be inserted in the itemlist
     * @param {array} itemList - contains the items
     * @returns {number} postion for 3d folder
     */
    postionFor3DFolder: function (itemList) {
        var position = itemList.length + 1;

        _.each(itemList, function (item, index) {
            if (item.name === "Hintergrundkarten") {
                position = index + 1;
            }
        });

        return position;
    },

    /**
     * Groups objects from the layerlist that match the IDs in the passed list.
     * @param  {string[]} ids - Array of ids whose objects are grouped together
     * @param  {Object[]} layerlist - Objects from the services.json
     * @return {Object[]} layerlist - Objects from the services.json
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

        // Wenn nicht alle LayerIDs des Arrays gefunden werden
        if (objectsByIds.length !== ids.length) {
            return null;
        }
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
     * Generates a Uniq ID with prefix
     * Before that, all spaces are removed from the prefix.
     * @param  {String} value - Prefix for Uniq-Id
     * @return {String} value - Uniq-Id
     */
    createUniqId: function (value) {
        var trimmedValue = value.replace(/[^a-zA-Z0-9]/g, "");

        return _.uniqueId(trimmedValue);
    },

    /**
     * @todo
     * @param {*} metaID - todo
     * @returns {*} todo
     */
    getItemsByMetaID: function (metaID) {
        var layers = this.get("itemList").filter(function (item) {
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
     * Returns the initial visible baselayer from config.json.
     * for array several id only the first one is passed
     * @return {String} layer inital visible baselayer
     */
    getInitVisibBaselayer: function () {
        var layer = _.findWhere(this.get("baselayer").Layer, {visibility: true});

        if (_.isUndefined(layer)) {
            return undefined;
        }

        if (_.isArray(layer.id)) {
            layer.id = layer.id[0];
        }
        return layer;
    },

    /**
     * Setter for attribute "itemList"
     * @param {*} value - todo
     * @returns {void}
     */
    setItemList: function (value) {
        this.set("itemList", value);
    },

    /**
     * Setter for attribute "itemList"
     * @param {*} value - todo
     * @returns {void}
     */
    setBaselayer: function (value) {
        this.set("baselayer", value);
    },

    /**
     * Setter for attribute "overlayer"
     * @param {*} value - todo
     * @returns {void}
     */
    setOverlayer: function (value) {
        this.set("overlayer", value);
    },

    /**
     * Setter for attribute "treeType"
     * @param {*} value - todo
     * @returns {void}
     */
    setTreeType: function (value) {
        this.set("treeType", value);
    },

    /**
     * Setter for attribute "category"
     * @param {*} value - todo
     * @returns {void}
     */
    setCategory: function (value) {
        this.set("category", value);
    }
});

export default Parser;
