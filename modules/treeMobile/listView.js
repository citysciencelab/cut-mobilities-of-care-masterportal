define([
    "backbone",
    "backbone.radio",
    "modules/treeMobile/list",
    "modules/treeMobile/FolderView",
    "modules/treeMobile/LayerView",
    "modules/treeMobile/ItemView",
    "modules/treeMobile/breadCrumb/listView"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        FolderView = require("modules/treeMobile/FolderView"),
        LayerView = require("modules/treeMobile/LayerView"),
        ItemView = require("modules/treeMobile/ItemView"),
        TreeCollection = require("modules/treeMobile/list"),
        BreadCrumbListView = require("modules/treeMobile/breadCrumb/listView"),
        ListView;

    ListView = Backbone.View.extend({
        collection: new TreeCollection(),
        tagName: "ul",
        className: "list-group tree-mobile",
        // der ausklappbare Teil der sich hinter dem "Burger-Button" befindet
        targetElement: "div.collapse.navbar-collapse",

        /**
         * Wird initial aufgerufen. Ruft weitere Funktionen auf und registriert Listener.
         */
        initialize: function () {
            this.listenTo(Radio.channel("MenuBar"), {
                // wird ausgeführt wenn das Menü zwischen mobiler Ansicht und Desktop wechselt
                "switchedMenu": this.render
            });

            this.collection.forEach(this.addViews, this);
            this.render();
        },

        /**
         * In der mobilen Ansicht wird die ListView und die erste Ebene gezeichnet.
         * In der desktop Ansicht wird die ListView und alle aktuell gezeichneten Elemente aus dem DOM entfernt.
         */
        render: function () {
            // true wenn sich das Menü in der mobilen Navigation befindet
            var isMobile = Radio.request("MenuBar", "isMobile");

            if (isMobile === true) {
                new BreadCrumbListView();
                $(this.targetElement).append(this.$el);
                this.collection.setModelsVisible("main");
            }
            else {
                this.collection.setAllModelsInvisible();
                this.$el.remove();
            }
        },

        /**
         * Ordnet den Models die richtigen Views zu.
         * @param {Backbone.Model} model - itemModel | layerModel | folderModel
         */
        addViews: function (model) {
            switch (model.getType()){
                case "folder": {
                    // Model für einen Ordner
                    new FolderView({model: model});
                    break;
                }
                case "layer": {
                    // Model für ein Layer
                    new LayerView({model: model});
                    break;
                }
                case "item": {
                    // Model für Tools/Links/andere Funktionen
                    new ItemView({model: model});
                    break;
                }
            }
        }
    });

    return ListView;
});
