define([
    "backbone",
    "backbone.radio",
    "modules/core/util",
    "config",
    "modules/treeMobile/dummyModel"
], function () {

     var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        Util = require("modules/core/util"),
        DummyModel = require("modules/treeMobile/dummyModel"),
        Config = require("config"),
        TreeCollection = Backbone.Collection.extend({
        // Pfad zur treeconfig
        url: "",
        isInitialized: false,

        initialize: function () {},
        init: function () {
             this.parseMainMenue();

            switch (Config.tree.type){
                case "default": {
                    this.parseLayerList();
                    this.isInitialized = true;
                    break;
                }
                case "ligth": {
                    this.parseLightTree();
                    this.isInitialized = true;
                    break;
                }
                case "custom": {
                    this.parseTreeConfig();
                    break;
                }
                case "dummy": {
                    for (var i = 0; i < 10; i++) {
                        this.add(new DummyModel(0));
                    }
                    this.isInitialized = true;
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
                    Util.hideLoader();
                    this.isInitialized = true;
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
