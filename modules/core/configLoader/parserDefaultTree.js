import Parser from "./parser";

const DefaultTreeParser = Parser.extend(/** @lends DefaultTreeParser.prototype */{
    /**
     * @class DefaultTreeParser
     * @extends Parser
     * @memberof Core.ConfigLoader
     * @fires Core#RadioRequestUtilIsViewMobile
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     * @constructs
     */
    defaults: _.extend({}, Parser.prototype.defaults, {
    }),

    /**
     * todo
     * @param {*} layerList - todo
     * @param {Object} Layer3dList - the 3d layer list or null
     * @returns {void}
     */
    parseTree: function (layerList, Layer3dList) {
        // Im Default-Tree(FHH-Atlas / GeoOnline) werden nur WMS angezeigt
        // Und nur Layer die min. einem Metadatensatz zugeordnet sind
        var newLayerList = this.filterList(layerList);

        // Entfernt alle Layer, die bereits im Cache dargestellt werden
        newLayerList = this.deleteLayersIncludeCache(newLayerList);

        // Für Layer mit mehr als 1 Datensatz, wird pro Datensatz 1 zusätzlichen Layer erzeugt
        newLayerList = this.createLayerPerDataset(newLayerList);

        this.parseLayerList(newLayerList, Layer3dList);
    },

    /**
     * Filters all objects from the layerList that are not WMS and are assigned to at least one data record.
     * @param  {Object[]} layerList - Objekte from services.json
     * @return {Object[]} layerList - Objekte from services.json
     */
    filterList: function (layerList) {
        return layerList.filter(function (element) {
            if (!_.has(element, "datasets")) {
                return false;
            }

            return element.datasets.length > 0 && _.contains(["WMS", "Terrain3D", "TileSet3D", "Oblique"], element.typ);
        });
    },

    /**
     * Removes all layers that are already displayed in the cache.
     * @param  {Object[]} layerList - Objekte from services.json
     * @return {Object[]} layerList - Objekte from services.json
     */
    deleteLayersIncludeCache: function (layerList) {
        var cacheLayerMetaIDs = [],
            cacheLayer = _.where(layerList, {cache: true});

        _.each(cacheLayer, function (layer) {
            cacheLayerMetaIDs.push(layer.datasets[0].md_id);
        });

        return _.reject(layerList, function (element) {
            return _.contains(cacheLayerMetaIDs, element.datasets[0].md_id) && element.cache === false;
        });
    },

    /**
     * Retrieves all objects with more than one record from the layerList
     * Creates a new layer per dataset
     * @param  {Object[]} layerList - Objekte from services.json
     * @return {Object[]} layerList - Objects from services.json that are assigned to exactly one dataset
     */
    createLayerPerDataset: function (layerList) {
        var layerListPerDataset = layerList.filter(function (element) {
            return element.datasets.length > 1;
        });

        _.each(layerListPerDataset, function (layer) {
            _.each(layer.datasets, function (ds, key) {
                var newLayer = _.clone(layer);

                newLayer.id = layer.id + "_" + key;
                newLayer.datasets = [ds];
                layerList.push(newLayer);
            });
        });
        return layerList.filter(function (element) {
            return element.datasets.length === 1;
        });
    },

    /**
     * Creates the layertree from the Services.json parsed by Rawlayerlist.
     * @param {object[]} layerList -
     * @param {Object} Layer3dList - the 3d layer list or null
     * @returns {void}
     */
    parseLayerList: function (layerList, Layer3dList) {
        var baseLayerIds = _.flatten(_.pluck(this.get("baselayer").Layer, "id")),
            // Unterscheidung nach Overlay und Baselayer
            typeGroup = _.groupBy(layerList, function (layer) {
                if (layer.typ === "Terrain3D" || layer.typ === "TileSet3D" || layer.typ === "Entities3D") {
                    return "layer3d";
                }
                else if (layer.typ === "Oblique") {
                    return "oblique";
                }
                return _.contains(baseLayerIds, layer.id) ? "baselayers" : "overlays";
            });

        // Models für die Hintergrundkarten erzeugen
        this.createBaselayer(layerList);
        // Models für die Fachdaten erzeugen
        this.groupDefaultTreeOverlays(typeGroup.overlays);
        // Models für 3D Daten erzeugen
        this.create3dLayer(typeGroup.layer3d, Layer3dList);
        // Models für Oblique Daten erzeugen
        this.createObliqueLayer(typeGroup.oblique);
    },

    /**
     * todo
     * @param {*} layerList - todo
     * @returns {void}
     */
    createObliqueLayer: function (layerList) {
        _.each(layerList, function (layer) {
            this.addItem(_.extend({type: "layer"}, layer));
        }, this);
    },

    /**
     * todo
     * @param {*} layerList - todo
     * @fires Core#RadioRequestUtilIsViewMobile
     * @param {Object} Layer3dList - the 3d layer list or null
     * @returns {void}
     */
    create3dLayer: function (layerList, Layer3dList) {
        const isMobile = Radio.request("Util", "isViewMobile"),
            isVisibleInTree = isMobile ? "false" : "true";

        let layer3DVisibility,
            layer3DVisible;

        if (layerList && Array.isArray(layerList)) {
            layerList.forEach(function (layer) {
                if (Layer3dList && typeof Layer3dList === "object" && Layer3dList.Layer && Layer3dList.Layer.length > 0) {

                    layer3DVisibility = Layer3dList.Layer.filter(function (layer3D) {
                        return layer3D.id === layer.id;
                    });
                    if (layer3DVisibility[0] !== undefined) {
                        layer3DVisible = layer3DVisibility[0].visibility;
                    }
                }

                this.addItem(_.extend({
                    type: "layer",
                    parentId: "3d_daten",
                    level: 0,
                    isVisibleInTree: isVisibleInTree,
                    isSelected: layer3DVisible ? layer3DVisible : false
                }, layer));
            }, this);
        }
    },

    /**
     * Creates the base layer items. "newLayer" may be undefined if its id gets removed by function deleteLayersIncludeCache.
     * Then the configured id is not found.
     * @param {Object[]} layerList Layers
     * @returns {void}
     */
    createBaselayer: function (layerList) {
        _.each(this.get("baselayer").Layer, function (layer) {
            var newLayer;

            if (_.isArray(layer.id)) {
                newLayer = _.extend(this.mergeObjectsByIds(layer.id, layerList), _.omit(layer, "id"));
            }
            else {
                newLayer = _.extend(_.findWhere(layerList, {id: layer.id}), _.omit(layer, "id"));
            }

            if (_.isUndefined(newLayer)) {
                console.error("Layer with id: " + layer.id + " cannot be found in layerlist. Possible error: layer got removed in function 'deleteLayersIncludeCache'.");
            }
            else {
                this.addItem(_.extend({
                    isBaseLayer: true,
                    isVisibleInTree: true,
                    level: 0,
                    parentId: "Baselayer",
                    type: "layer"
                }, newLayer));
            }
        }, this);
    },

    /**
     * subdivide the layers grouped by metaName into folders
     * and layers if a MetaNameGroup has only one entry
     * it should be added as layer and not as folder
     * @param {object[]} metaNameGroups - todo
     * @param {string} name - todo
     * @returns {object} categories
    */
    splitIntoFolderAndLayer: function (metaNameGroups, name) {
        var folder = [],
            layer = [],
            categories = {};

        _.each(metaNameGroups, function (group, groupname) {
            // Wenn eine Gruppe mehr als einen Eintrag hat -> Ordner erstellen
            if (Object.keys(group).length > 1) {
                folder.push({
                    name: groupname,
                    layer: group,
                    id: this.createUniqId(groupname)
                });
            }
            else {
                layer.push(group[0]);
            }
            categories.folder = folder;
            categories.layer = layer;
            categories.id = this.createUniqId(name);
            categories.name = name;
        }, this);
        return categories;
    },

    /**
     * Groups layers by category and MetaName
     * @param  {Object} overlays - The technical data as an object
     * @returns {void}
     */
    groupDefaultTreeOverlays: function (overlays) {
        var tree = {},
            categoryGroups = _.groupBy(overlays, function (layer) {
                // Gruppierung nach Opendatakategorie
                if (this.get("category") === "Opendata") {
                    return layer.datasets[0].kategorie_opendata[0];
                }
                // Gruppierung nach Inspirekategorie
                else if (this.get("category") === "Inspire") {
                    return layer.datasets[0].kategorie_inspire[0];
                }
                else if (this.get("category") === "Behörde") {
                    return layer.datasets[0].kategorie_organisation;
                }
                return "Nicht zugeordnet";
            }, this);

        // Gruppierung nach MetaName
        _.each(categoryGroups, function (group, name) {
            var metaNameGroups = _.groupBy(group, function (layer) {
                return layer.datasets[0].md_name;
            });

            // in Layer und Ordner unterteilen
            tree[name] = this.splitIntoFolderAndLayer(metaNameGroups, name);
        }, this);
        this.createModelsForDefaultTree(tree);
    },

    /**
     * Creates all models for the DefaultTree
     * @param  {Object} tree tree created from the categories and MetaNames
     * @fires QuickHelp#RadioRequestQuickHelpIsSet
     * @returns {void}
     */
    createModelsForDefaultTree: function (tree) {
        var sortedKeys = Object.keys(tree).sort(),
            sortedCategories = [],
            isQuickHelpSet = Radio.request("QuickHelp", "isSet");

        _.each(sortedKeys, function (key) {
            sortedCategories.push(tree[key]);
        });
        // Kategorien erzeugen
        this.addItems(sortedCategories, {
            type: "folder",
            parentId: "Overlayer",
            level: 0,
            isInThemen: true,
            isVisibleInTree: true,
            glyphicon: "glyphicon-plus-sign",
            quickHelp: isQuickHelpSet
        });
        _.each(tree, function (category) {
            // Unterordner erzeugen
            this.addItems(category.folder, {
                glyphicon: "glyphicon-plus-sign",
                isFolderSelectable: this.get("isFolderSelectable"),
                isInThemen: true,
                isLeafFolder: true,
                level: 1,
                parentId: category.id,
                type: "folder",
                quickHelp: isQuickHelpSet
            });
            _.each(category.layer, function (layer) {
                layer.name = layer.datasets[0].md_name;
            });
            // Layer dirket in Kategorien
            this.addItems(category.layer, {
                isBaseLayer: false,
                level: 1,
                parentId: category.id,
                type: "layer"
            });
            _.each(category.folder, function (folder) {
                // Layer in der untertesten Ebene erzeugen
                this.addItems(folder.layer, {
                    isBaseLayer: false,
                    level: 2,
                    parentId: folder.id,
                    type: "layer"
                });
            }, this);
        }, this);
    }
});

export default DefaultTreeParser;
