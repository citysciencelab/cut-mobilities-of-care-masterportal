define([
    "backbone.radio",
    "modules/core/parser/portalConfig"
], function () {

     var Parser = require("modules/core/parser/portalConfig"),
        Radio = require("backbone.radio"),

        DefaultTreeParser = Parser.extend({
        initialize: function () {
            var layerList = Radio.request("RawLayerList", "getLayerAttributesList");

            this.parseTree(layerList);
        },

        /**
         *
         */
        parseTree: function (layerList) {
            // Im Default-Tree(FHH-Atlas / GeoOnline) werden nur WMS angezeigt
            // Und nur Layer die einem Metadatensatz zugeordnet sind
            layerList = this.filterList(layerList);
            this.parseLayerList(layerList);

        },

        /**
         * Filtert alle Objekte aus der layerList, die kein WMS sind und min. einem Datensatz zugordnet sind
         * @param  {Object[]} layerList - Objekte aus der services.json
         * @return {Object[]} layerList - Objekte aus der services.json
         */
        filterList: function (response) {
            return _.filter(response, function (element) {
                return (element.datasets.length > 0 && element.typ === "WMS") ;
            });
        },

         /**
        * Holt sich die Liste der Layer aus dem Layermodul
        * und erzeugt daraus einen Baum
        */
        parseLayerList: function (layerList) {
            var baseLayerIds = _.pluck(this.getBaselayer().Layer, "id"),
                // Unterscheidung nach Overlay und Baselayer
                typeGroup = _.groupBy(layerList, function (layer) {
                    return (_.contains(baseLayerIds, layer.id)) ? "baselayers" : "overlays";
                });

            // Models für die Baselayer erzeugen
            this.addItems(typeGroup.baselayers, {parentId: "BaseLayer", level: 0});

            // Models für die Fachdaten erzeugen
            this.groupDefaultTreeOverlays(typeGroup.overlays);
        },

        /**
         * unterteilung der nach metaName groupierten Layer in Ordner und Layer
         * wenn eine MetaNameGroup nur einen Eintrag hat soll sie
         * als Layer und nicht als Ordner hinzugefügt werden
        */
        splitIntoFolderAndLayer: function (metaNameGroups, title) {
            var folder = [],
                layer = [],
                categories = {};

            _.each(metaNameGroups, function (group, groupTitle) {
                // Wenn eine Gruppe mehr als einen Eintrag hat -> Ordner erstellen
                if (Object.keys(group).length > 1) {
                    folder.push({
                        title: groupTitle,
                        layer: group,
                        id: _.uniqueId(groupTitle)
                    });
                }
                else {
                    layer.push(group[0]);
                }
                categories.folder = folder;
                categories.layer = layer;
                categories.id = _.uniqueId(title);
                categories.title = title;
            });
            return categories;
        },
        /**
         * Gruppiert die Layer nach Kategorie und MetaName
         * @param  {Object} overlays die Fachdaten als Object
         */
        groupDefaultTreeOverlays: function (overlays) {
            var tree = {},
                // Gruppierung nach Opendatakategorie
                categoryGroups = _.groupBy(overlays, function (layer) {
                return layer.datasets[0].kategorie_opendata[0];
            });
           // Gruppierung nach MetaName
            _.each(categoryGroups, function (group, title) {
                var metaNameGroups = _.groupBy(group, function (layer) {
                    return layer.datasets[0].md_name;
                });
                // in Layer und Ordner unterteilen
                tree[title] = this.splitIntoFolderAndLayer(metaNameGroups, title);
            }, this);
            this.createModelsForDefaultTree(tree);
        },

        /**
         * Erzeugt alle Models für den DefaultTree
         * @param  {Object} tree aus den categorien und MetaNamen erzeugter Baum
         */
        createModelsForDefaultTree: function (tree) {
            var sortedKeys = Object.keys(tree).sort(),
                sortedCategories = [];

            _.each(sortedKeys, function (key) {
                sortedCategories.push(tree[key]);
            });
            // Kategorien erzeugen

            this.addItems(sortedCategories, {parentId: "OverLayer", level: 0});
            _.each(tree, function (category) {
                // Unterordner erzeugen
                this.addItems(category.folder, {parentId: category.id, isLeaffolder: true, level: 1});
                // Layer in Unterordner
                this.addItems(category.layer, {parentId: category.id, level: 1});
                _.each(category.folder, function (folder) {
                    // Layer in der untertesten Ebene erzeugen
                    this.addItems(folder.layer, {parentId: folder.id, level: 2});
                }, this);
            }, this);
        }
    });

    return DefaultTreeParser;
});
