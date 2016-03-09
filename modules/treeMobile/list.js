define([
    "backbone",
    "backbone.radio",
    "modules/core/util",
    "config",
    "modules/treeMobile/dummyModel",
    "modules/treeMobile/folderModel",
    "modules/treeMobile/itemModel",
    "modules/treeMobile/layerModel"
], function () {

     var Backbone = require("backbone"),
         Util = require("modules/core/util"),
         Dummy = require("modules/treeMobile/dummyModel"),
         Folder = require("modules/treeMobile/folderModel"),
         Item = require("modules/treeMobile/itemModel"),
         Layer = require("modules/treeMobile/layerModel"),
         Config = require("config"),
         TreeCollection;

    TreeCollection = Backbone.Collection.extend({
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
            else if (attrs.type === "dummy") {
                return new Dummy(attrs, options);
            }
        },
        // Pfad zur treeconfig
        url: "",

        initialize: function () {
             this.parseMainMenue();
             this.parseTools();

            switch (Config.tree.type){
                case "default": {
                    this.parseLayerList();
                    break;
                }
                case "light": {
                    this.parseLightTree();
                    break;
                }
                case "custom": {
                    this.parseTreeConfig();
                    break;
                }
                case "dummy": {
                    for (var i = 0; i < 10; i++) {
                        this.add({type: "dummy"});
                    }
                    for (var i = 0; i < 10; i++) {
                        this.add({type: "dummy", parentID: 1});
                    }
                }
            }
        },
        /**
        * Ließt aus der Config aus, welche Menüeinträge
        * angezeigt werden sollen und erzeugt daraus die
        * oberen statischen Menüelmente (alles außer den Baum)
        */
        parseMainMenue: function () {
            _.each(Config.menuItems, function (value, key) {
                if (key === "tree" || key === "tools") {
                    this.add({
                        type: "folder",
                        title: value.title,
                        glyphicon: value.glyphicon,
                        isRoot: true,
                        id: key
                    });
                }
                else {
                    this.add({
                        type: "item",
                        title: value.title,
                        glyphicon: value.glyphicon,
                        isRoot: true,
                        id: key
                    });
                }
            }, this);
        },

        parseTools: function () {
            var toolId = this.findWhere({isRoot: true, id: "tools"}).id;

            if (_.isUndefined(toolId) === false) {
                _.each(Config.tools, function (value) {
                    this.add({type: "item", title: value.title, glyphicon: value.glyphicon, parentId: toolId});
                }, this);
            }
        },
        /**
        * Ließt aus der Config die Layer aus und
        * erzeugt daraus einen Baum mit nur einer Ebene.
        * In dieser Ebene sind alle Layer
        */
        parseLightTree: function () {
            var treeId = this.findWhere({isRoot: true, id: "tree"}).id;

            _.each(Config.tree.layer, function (element) {
                this.add({
                    type: "layer",
                    parentId: treeId,
                    layerId: element.id
                });
            }, this);
        },
        /**
        * Lädt eine Treeconfig und erzeugt daraus einen Baum
        * die Treeconfig wird in parse() geparst
        */
        parseTreeConfig: function () {
            this.fetch({
                beforeSend: Util.showLoader(),
                success: function () {
                    // Util.hideLoader();
                }
            });
        },
        /**
         * parsed die gefetchte Treeconfig
         * @param  {[type]} response [description]
         */
        parse: function (response) {
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
            var children = this.where({parentId: parentId});

            _.each(children, function (model) {
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
        * Setzt bei Änderung der Ebene, alle Model
        * auf der alten Ebene auf unsichtbar
        * darf erst aufgerufen werden, nachdem
        * die Animation der ebenänderung fertig ist
        * @param {int} parentId Die ID des Objektes dessen Kinder nicht mehr angezeigt werden sollen
        */
        setModelsInVisible: function (parentId) {}
    });

    return TreeCollection;
});
