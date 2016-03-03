define([
    "backbone",
    "modules/treeMobile/list",
    "modules/treeMobile/dummyView"
], function () {
    var Backbone = require("backbone"),
    Radio = require("backbone.radio"),
    DummyView = require("modules/treeMobile/dummyView"),
    TreeCollection = require("modules/treeMobile/list"),
    ListView = Backbone.View.extend({
        collection: new TreeCollection(),
        tagName: "ul",
        className: "tree-mobile",
        targetElement: $(".changelog-content"), // $("div.collapse.navbar-collapse"),
        initialize: function () {
            // Baue Baum in collection
            this.collection.init();

            // Wird getriggert, wenn der Baum fertig ist.
            this.listenTo(this.collection, "change:isInitialized", this.setUpAndRender());
        },
        render: function () {
            this.targetElement.empty();

            this.targetElement.append(this.$el);
        },
        /**
         * Den Models Views zuordnen
         * Rendern
         */
        setUpAndRender: function () {
            this.setViews();
            this.render();
            // Veranlasst die Oberste Ebene sich zu rendern
            this.collection.setModelsVisible(0);
        },
        /**
         * Ordnet den Models die richtigen Views zu
         */
        setViews: function () {
            if (this.collection.isInitialized) {
                this.collection.forEach(function (model) {
                    switch (model.getType()){
                        case "folder": {
                            if (model.getIsLeafFolder()) {
                                // Model das alle Layer dieser Ebene auszuwählen kann
                            }
                            else {
                                // Model das seine Kinder lädt
                            }
                            break;
                        }
                        case "layer": {
                                // Model für ein Layer
                            break;
                        }
                        case "item": {
                                // Model für Tools/Links/ander Funktionen
                            break;
                        }
                         case "dummy": {
                                // Model für Testzwecke
                                new DummyView(model,this.$el);
                            break;
                        }
                    }
                }, this);
            }
        }
    });

    return ListView;
});
