define([
    "backbone",
    "backbone.radio",
    "modules/core/util",
    "config",
    "modules/treeMobile/folderModel",
    "modules/treeMobile/itemModel",
    "modules/treeMobile/layerModel",
    "jqueryui/effect",
    "jqueryui/effect-slide"
], function () {

     var Backbone = require("backbone"),
         Util = require("modules/core/util"),
         Radio = require("backbone.radio"),
         Folder = require("modules/treeMobile/folderModel"),
         Item = require("modules/treeMobile/itemModel"),
         Layer = require("modules/treeMobile/layerModel"),
         Config = require("config"),
         treeNodes = [],
         TreeCollection;

    TreeCollection = Backbone.Collection.extend({
        // Pfad zur custom-treeconfig
        url: "tree-config.json",
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
            this.listenTo(this, {
                "change:isChecked": this.toggleIsChecked
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
                    id: key
                });
            }, this);
            // Back-Item
            this.add({
                type: "item",
                title: "Zurück",
                glyphicon: "glyphicon-arrow-left",
                id: "backItem"
            });
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
                title: "Auswahl der Karten",
                glyphicon: "glyphicon-plus-sign",
                isRoot: false,
                id: "SelectedLayer",
                parentId: "tree",
                isLeafFolder: true
            });
        },

        addToolItems: function () {
            _.each(Config.tools, function (value) {
                this.add({
                    type: "item",
                    title: value.title,
                    glyphicon: value.glyphicon,
                    parentId: "tools"
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

            _.each(layerList, function (element) {
                this.add({
                    type: "layer",
                    parentId: "tree",
                    layerId: element.get("id"),
                    title: element.get("name")
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
                            treeNodes.push({
                                type: "layer",
                                parentId: parentId,
                                layerId: layer.id
                            });
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
        * Holt sich die Liste detr Layer aus dem Layermodul
        * und erzeugt daraus einen Baum
        */
        parseLayerList: function () {},
        /**
        * Setzt bei Änderung der Ebene, alle Model
        * auf der neuen Ebene auf sichtbar
        * @param {int} parentId Die Id des Objektes dessen Kinder angezeigt werden sollen
        */
        setModelsVisible: function (parentId) {
            var children = this.where({parentId: parentId}),
                // Falls es ein LeafFolder ist --> "Alle auswählen" Template
                selectedLeafFolder = this.where({isExpanded: true, isLeafFolder: true}),
                backItem = this.where({id: "backItem"});

            _.each(_.union(backItem, selectedLeafFolder, children), function (model) {
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
         * Setzt die ParentId für ItemBack (zurück Button)
         * @param {[type]} value [description]
         */
        setParentIdForBackItem: function (value) {
            var parent = this.get(value);

            if (_.isUndefined(parent)) {
                this.showRootModels();
            }
            else {
                this.get("backItem").setParentId(parent.getParentId());
            }
        },

        unsetIsExpanded: function (value) {
            var item = this.findWhere({parentId: value, isExpanded: true});

            if (!_.isUndefined(item)) {
                item.setIsExpanded(false);
            }
        },

        // zeichnet die erste Ebene
        showRootModels: function () {
            var children = this.where({isRoot: true});

            _.each(children, function (model) {
                model.setIsVisible(true);
            });
        },

        /**
         * Alle Models von einem Leaffolder werden selektiert
         * @param {String} parentId Die ID des Objektes dessen Kinder alle auf "checked" gesetzt werden
         */
         toggleIsChecked: function (model) {
             if (model.getType() === "folder") {
                 var children = this.where({parentId: model.getId()});

                 _.each(children, function (child) {
                     child.toggleIsChecked(model.getIsChecked());
                 });
             }
         },

        /**
        * Setzt bei Änderung der Ebene, alle Model
        * auf der alten Ebene auf unsichtbar
        * darf erst aufgerufen werden, nachdem
        * die Animation der ebenänderung fertig ist
        * @param {int} parentId Die ID des Objektes dessen Kinder nicht mehr angezeigt werden sollen
        */
        setModelsInvisible: function (parentId) {}
    });

    return TreeCollection;
});
