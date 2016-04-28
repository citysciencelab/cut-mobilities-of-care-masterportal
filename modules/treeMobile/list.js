define([
    "backbone",
    "backbone.radio",
    "modules/core/util",
    "config",
    "modules/treeMobile/folder/model",
    "modules/treeMobile/item/model",
    "modules/treeMobile/layer/model",
    "jqueryui/effect",
    "jqueryui/effect-slide"
], function () {

     var Backbone = require("backbone"),
         Util = require("modules/core/util"),
         Radio = require("backbone.radio"),
         Folder = require("modules/treeMobile/folder/model"),
         Item = require("modules/treeMobile/item/model"),
         Layer = require("modules/treeMobile/layer/model"),
         Config = require("config"),
         treeNodes = [],
         TreeCollection;

    TreeCollection = Backbone.Collection.extend({
        // Pfad zur custom-treeconfig
        url: "tree-config.json",
        // Sortiert die Liste nach einem Model-Attribut
        comparator: function (model) {
            // Models die sich in "Auswahl der Karten befinden"
            var modelsInSelection = this.where({isInSelection: true});

            if (modelsInSelection.length) {
                if (model.getType() === "layer" && model.getIsInSelection()) {
                    // inverse Sortierung über "selectionIDX"
                    return -model.getSelectionIDX();
                }
                else {
                    return -1;
                }
            }
            else {
                // Sortierung über "type"
                return model.getType();
            }
        },
        model: function (attrs, options) {
            if (attrs.type === "folder") {
                return new Folder(attrs, options);
            }
            else if (attrs.type === "layer") {
                return new Layer(attrs, options);
            }
            else if (attrs.type === "item") {
                return new Item(attrs, options);
            }
        },
        initialize: function () {
            var channel = Radio.channel("TreeList");

            channel.on({
                "setLayerAttributions": function (layerId, attrs) {
                    debugger;
                    var model = this.findWhere({type: "layer", layerId: layerId});

                    model.set(attrs);
                },
                "updateList": this.updateList,
                "checkIsExpanded": this.checkIsExpanded
            }, this);

            this.listenTo(this, {
                "change:selectionIDX": function () {
                    this.sort({animation: "without"});
                }
            });

            this.addMenuItems();
            this.addToolItems();

            switch (Config.tree.type){
                case "default": {
                    this.addTreeMenuItems();
                    this.parseLayerList();
                    break;
                }
                case "light": {
                    this.parseLightTree();
                    break;
                }
                case "custom": {
                    this.addTreeMenuItems();
                    this.fetchTreeConfig();
                    break;
                }
            }
        },

        /**
        * Ließt aus der Config aus, welche Menüeinträge
        * angezeigt werden sollen und erzeugt daraus die
        * oberen statischen Menüelmente (alles außer den Baum)
        */
        addMenuItems: function () {
            _.each(Config.menuItems, function (value, key) {
                this.add({
                    type: (key === "tree" || key === "tools") ? "folder" : "item",
                    title: value.title,
                    glyphicon: value.glyphicon,
                    isRoot: true,
                    id: key,
                    name: key,
                    parentId: "main",
                    email: (key === "contact") ? value.email : undefined
                });
            }, this);
        },

        /**
         * Erstellt die 1. Themenbaum-Ebene bei custom und default (Hintergrundkarten, Fachdaten und Auswahlt der Karten).
         */
        addTreeMenuItems: function () {
            this.add({
                type: "folder",
                title: "Hintergrundkarten",
                glyphicon: "glyphicon-plus-sign",
                isRoot: false,
                id: "BaseLayer",
                parentId: "tree"
            });
            this.add({
                type: "folder",
                title: "Fachdaten",
                glyphicon: "glyphicon-plus-sign",
                isRoot: false,
                id: "OverLayer",
                parentId: "tree"
            });
            this.add({
                type: "folder",
                title: "Auswahl der Themen",
                glyphicon: "glyphicon-plus-sign",
                isRoot: false,
                id: "SelectedLayer",
                parentId: "tree",
                isLeafFolder: true
            });
        },
        /**
         * erzeugt die Werkzeugliste im Baum
         */
        addToolItems: function () {
            _.each(Config.tools, function (value, key) {
                this.add({
                    type: "item",
                    title: value.title,
                    glyphicon: value.glyphicon,
                    parentId: "tools",
                    name: key
                });
            }, this);
        },
        /**
        * Ließt aus der Config die Layer aus und
        * erzeugt daraus einen Baum mit nur einer Ebene.
        * In dieser Ebene sind alle Layer
        */
        parseLightTree: function () {
            var layerList = Radio.request("LayerList", "getLayerList");

            _.each(layerList.reverse(), function (element) {
                this.add({
                    type: "layer",
                    parentId: "tree",
                    layerId: element.get("id"),
                    title: element.get("name"),
                    treeType: "light"
                });
            }, this);
        },
        /**
        * Lädt eine Treeconfig und erzeugt daraus einen Baum
        * die Treeconfig wird in parse() geparst
        */
        fetchTreeConfig: function () {
            this.fetch({
                remove: false,
                async: false,
                beforeSend: Util.showLoader(),
                success: function () {
                    Util.hideLoader();
                }
            });
        },
        /**
         * parsed die gefetchte Treeconfig
         * @param  {Object} response - Die treeConfig JSON
         */
        parse: function (response) {
            // key = Hintergrundkarten || Fachdaten || Ordner
            // value = Array von Objekten (Layer || Ordner)
            _.each(response, function (value, key) {
                var parentId = "";

                if (key === "Hintergrundkarten") {
                    parentId = "BaseLayer";
                }
                else if (key === "Fachdaten") {
                    parentId = "OverLayer";
                }
                else {
                    parentId = value[0].id;
                }

                _.each(value, function (element) {
                    if (_.has(element, "Layer")) {
                        _.each(element.Layer, function (layer) {
                            // HVV :(
                            if (_.has(layer, "styles") && layer.styles.length > 1) {
                                _.each(layer.styles, function (style) {
                                    treeNodes.push(_.extend({type: "layer", parentId: parentId, layerId: layer.id + style.toLowerCase()}, _.omit(layer, "id")));
                                });
                            }
                            else {
                                treeNodes.push(_.extend({type: "layer", parentId: parentId, layerId: layer.id}, _.omit(layer, "id")));
                            }
                        });
                    }
                    if (_.has(element, "Ordner")) {
                        _.each(element.Ordner, function (folder) {
                            folder.id = _.uniqueId(folder.Titel);
                            treeNodes.push({
                                type: "folder",
                                parentId: parentId,
                                title: folder.Titel,
                                id: folder.id,
                                isLeafFolder: (!_.has(folder, "Ordner")) ? true : false
                            });
                            // rekursiver Aufruf
                            this.parse({"Ordner": [folder]});
                        }, this);
                    }
                }, this);
            }, this);

            return treeNodes;
        },
        /**
         * Erzeugt aus einem Übergebenen Array Layer Models
         * und fügt sie alphabetisch sortiert der collection hinzu
         * @param  {array} layers   ein array mit Modeln
         * @param  {String} parentId die Id des Eltern Model
         */
        createLayersModels: function (layers, parentId) {
            layers = _.sortBy(layers, function (layer) {
                return layer.name[0].trim().toUpperCase();
            });

            _.each(layers, function (layer) {
                treeNodes.push({
                    type: "layer",
                    parentId: parentId,
                    layerId: layer.id,
                    title: layer.name,
                    id: layer.id
                });
            });
        },
        /**
         * Erzeugt aus einem Übergebenen Array Ordner Models
         * und fügt sie alphabetisch sortiert der collection hinzu
         * @param  {array} folder   ein array mit Modeln
         * @param  {String}  parentId die Id des Eltern Model
         */
        createFolderModels: function (folders, parentId) {
            folders = _.sortBy(folders, function (folder) {
                    return folder.title.trim().toUpperCase();
                });

            _.each(folders, function (folder) {
                treeNodes.push({
                    type: "folder",
                    parentId: parentId,
                    title: folder.title,
                    id: folder.id,
                    isLeafFolder: (_.has(folder, "folder")) ? false : true
                });
            });

        },
        /**
        * Holt sich die Liste detr Layer aus dem Layermodul
        * und erzeugt daraus einen Baum
        */
        parseLayerList: function () {
            var layerList = Radio.request("LayerList", "getResponse"),//Radio.request("LayerList", "getLayerList"),
                // Unterscheidung nach Overlay und Baselayer
                typeGroup = _.groupBy(layerList, function (layer) {
                return (layer.isbaselayer) ? "baselayer" : "overlay";
            });
            // Models für die Baselayer erzeugen
            this.createLayersModels(typeGroup.baselayer, "BaseLayer");
            // Models für die Fachdaten erzeugen
            this.groupDefaultTreeOverlays(typeGroup.overlay);
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
            this.createFolderModels(sortedCategories, "OverLayer");

            _.each(tree, function (category) {
                // Unterordner erzeugen
                this.createFolderModels(category.folder, category.id);
                this.createLayersModels(category.layer, category.id);
                _.each(category.folder, function (folder) {
                    // Layer in der untertestenEbene erzeugen
                    this.createLayersModels(folder.layer, folder.id);
                }, this);
            }, this);
            // console.log(treeNodes[125]);
           // this.add(treeNodes, {sort: false});
        },

        /**
         * [updateList description]
         * @param  {String} parentId
         */
        updateList: function (parentId, animation) {
                        console.log(treeNodes);
            var t = new Date().getTime();
            var response = Radio.request("LayerList", "getResponse");
            var currentLevel = _.where(treeNodes, {parentId: parentId}, {sort: false});
            _.each(currentLevel, function (item) {
                if (item.type === "layer") {
                    Radio.trigger("LayerList", "addModel", _.find(response, function (layer) {
                        return layer.id === item.layerId;
                    }));
                }
            });

            //this.add(Radio.request("LayerList", "getLayerList"));

           this.add(_.where(treeNodes, {parentId: parentId}), {sort: false});
            console.log(new Date().getTime()-t);
            // console.log(this.models);
            var checkedLayer = this.where({isChecked: true, type: "layer"}),
                // befinden wir uns in "Auswahl der Karten"
                isSelection = (parentId === "SelectedLayer") ? true : false;

            // Alle Models werden unsichtbar geschaltet
            this.setAllModelsInvisible();
            if (isSelection === false) {
                this.setModelsVisible(parentId);
                // Wenn Layer in der Auswahl ist, dann Zahnrad anzeigen
                this.setIsSettingVisible(isSelection);
            }
            // Ausgewählte Layer der Selection hinzufügen
            _.each(checkedLayer, function (layer) {
                layer.setIsInSelection(isSelection);
            });
            this.sort({animation: animation});
        },

        /**
         * [checkIsExpanded description]
         * @return {[type]} [description]
         */
        checkIsExpanded: function () {
            var folderModel = this.findWhere({isExpanded: true});

            if (!_.isUndefined(folderModel)) {
                folderModel.setIsExpanded(false);
            }
        },

        /**
        * Setzt bei Änderung der Ebene, alle Model
        * auf der neuen Ebene auf sichtbar
        * @param {int} parentId Die Id des Objektes dessen Kinder angezeigt werden sollen
        */
        setModelsVisible: function (parentId) {
            var children = this.where({parentId: parentId}),
                // Falls es ein LeafFolder ist --> "Alle auswählen" Template
                selectedLeafFolder = this.where({id: parentId, isLeafFolder: true});

            _.each(_.union(selectedLeafFolder, children), function (model) {
                model.setIsVisible(true);
            });
        },

        /**
         * Setzt alle Model unsichtbar
         */
        setAllModelsInvisible: function () {
            this.forEach(function (model) {
                model.setIsVisible(false);
            });
        },

        /**
         * Alle Layermodels von einem Leaffolder werden "gechecked" oder "unchecked"
         * @param {Backbone.Model} model - folderModel
         */
         toggleIsCheckedLayers: function (model) {
             var layers = this.where({parentId: model.getId()});

             _.each(layers, function (layer) {
                 layer.setIsChecked(model.getIsChecked());
             });
         },

         /**
          * Prüft ob alle Layer im Leaffolder isChecked = true sind
          * Falls ja, wird der Leaffolder auch auf isChecked = true gesetzt
          * @param {Backbone.Model} model - layerModel
          */
         everyLayerIsChecked: function (model) {
             var layers = this.where({parentId: model.getParentId()}),
                folderModel = this.findWhere({id: model.getParentId()}),
                allLayersChecked = _.every(layers, function (layer) {
                     return layer.getIsChecked() === true;
                });

             if (allLayersChecked === true) {
                 folderModel.setIsChecked(true);
             }
             else {
                 folderModel.setIsChecked(false);
             }
         },
        /**
         * Steuert, ob an den Models in der Auswahl das Zahnrad angezeigt werden soll
         * dies soll nur geschehen, wenn die Auswahl gerade angezeigt wird.
         * @param {[type]} value [description]
         */
        setIsSettingVisible: function (value) {
            var models = this.where({type: "layer"});

            _.each(models, function (model) {
                model.setIsSettingVisible(value);
            });
        }
    });

    return TreeCollection;
});
