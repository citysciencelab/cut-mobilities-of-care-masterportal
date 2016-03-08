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
        comparator: "id",
        // Pfad zur treeconfig
        url: "",

        initialize: function () {
             this.parseMainMenue();

            switch (Config.tree.type){
                case "default": {
                    this.parseLayerList();
                    break;
                }
                case "ligth": {
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
        parseMainMenue: function () {},
        /**
        * Ließt aus der Config die Layer aus und
        * erzeugt daraus einen Baum mit nur einer Ebene.
        * In dieser Ebene sind alle Layer
        */
        parseLightTree: function () {},
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
        * @param {int} parentID Die ID des Objektes dessen Kinder angezeigt werden sollen
        */
        setModelsVisible: function (parentID) {
            var children = this.where({parentID: parentID});

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
        * @param {int} parentID Die ID des Objektes dessen Kinder nicht mehr angezeigt werden sollen
        */
        setModelsInVisible: function (parentID) {}
    });

    return TreeCollection;
});
