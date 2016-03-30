define([
    "backbone",
    "backbone.radio",
    "modules/treeMobile/list",
    "modules/treeMobile/FolderView",
    "modules/treeMobile/LayerView",
    "modules/treeMobile/ItemView",
    "modules/treeMobile/dummyView"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        DummyView = require("modules/treeMobile/dummyView"),
        FolderView = require("modules/treeMobile/FolderView"),
        LayerView = require("modules/treeMobile/LayerView"),
        ItemView = require("modules/treeMobile/ItemView"),
        TreeCollection = require("modules/treeMobile/list"),
        ListView;

    ListView = Backbone.View.extend({
        collection: new TreeCollection(),
        tagName: "ul",
        className: "tree-mobile list-group",
        targetElement: "div.collapse.navbar-collapse",
        initialize: function () {
            this.listenTo(Radio.channel("MenuBar"), {
                "switchedMenu": this.render
            });

            this.collection.forEach(this.addViews, this);
            this.render();
        },
        render: function () {
            var isMobile = Radio.request("MenuBar", "isMobile");

            if (isMobile === true) {
                $(this.targetElement).append(this.$el);
                this.collection.showRootModels();
            }
            else {
                this.collection.setAllModelsInvisible();
            }
        },
        /**
         * Ordnet den Models die richtigen Views zu
         */
        addViews: function (model) {
            switch (model.getType()){
                case "folder": {
                    // gleiche View/model Komponente mit zwei Templates??
                    if (model.getIsLeafFolder()) {
                        // Model das alle Layer dieser Ebene auszuwählen kann
                        new FolderView({model: model});
                    }
                    else {
                        // Model das seine Kinder lädt
                        new FolderView({model: model});
                    }
                    break;
                }
                case "layer": {
                    // Model für ein Layer
                    new LayerView({model: model});
                    break;
                }
                case "item": {
                    // Model für Tools/Links/ander Funktionen
                    new ItemView({model: model});
                    break;
                }
                 case "dummy": {
                    // Model für Testzwecke
                    new DummyView({model: model});
                    // this.$el.prepend(t.render().el);
                    break;
                }
            }
        }
    });

    return ListView;
});
