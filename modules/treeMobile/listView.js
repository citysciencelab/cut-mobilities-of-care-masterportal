define([
    "backbone",
    "backbone.radio",
    "modules/treeMobile/list",
    "modules/treeMobile/folder/view",
    "modules/treeMobile/layer/view",
    "modules/treeMobile/item/view",
    "modules/treeMobile/breadCrumb/listView",
    "jqueryui/effect",
    "jqueryui/effect-slide"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        FolderView = require("modules/treeMobile/folder/view"),
        LayerView = require("modules/treeMobile/layer/view"),
        ItemView = require("modules/treeMobile/item/view"),
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

            this.listenTo(this.collection, {
                "updateList": function (options) {
                    if (options.animation === "without") {
                        this.renderListWithoutAnimation();
                    }
                    else {
                        this.renderListWithAnimation(options);
                    }
                }
            });

            new BreadCrumbListView();
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
                var rootModels = this.collection.where({isRoot: true});

                this.$el.html("");
                $(this.targetElement).append(this.$el);
                _.each(rootModels, this.addViews, this);
            }
            else {
                this.$el.remove();
            }
        },

        renderListWithoutAnimation: function () {
            var visibleModels = this.collection.where({isVisible: true}),
                modelsInSelection = this.collection.where({isInSelection: true});

            this.$el.html("");
            if (modelsInSelection.length) {
                visibleModels = _.sortBy(visibleModels, function (layer) {
                    return layer.getSelectionIDX();
                });
                _.each(visibleModels.reverse(), this.addViews, this);
            }
            else {
                _.each(visibleModels, this.addViews, this);
            }
        },

        renderListWithAnimation: function (options) {
            var visibleModels = this.collection.where({isVisible: true}),
                modelsInSelection = this.collection.where({isInSelection: true}),
                slideOut = (options.animation === "slideBack") ? "right" : "left",
                slideIn = (options.animation === "slideForward") ? "right" : "left",
                that = this;

                this.$el.effect("slide", {direction: slideOut, duration: 200, mode: "hide"}, function () {
                    that.$el.html("");
                    if (modelsInSelection.length) {
                        visibleModels = _.sortBy(visibleModels, function (layer) {
                            return layer.getSelectionIDX();
                        });
                        _.each(visibleModels.reverse(), that.addViews, that);
                    }
                    else {
                        _.each(visibleModels, that.addViews, that);
                    }
                });
                this.$el.effect("slide", {direction: slideIn, duration: 200, mode: "show"});
        },

        /**
         * Ordnet den Models die richtigen Views zu.
         * @param {Backbone.Model} model - itemModel | layerModel | folderModel
         */
        addViews: function (model) {
            var nodeView;

            switch (model.getType()){
                case "folder": {
                    // Model für einen Ordner
                    nodeView = new FolderView({model: model});
                    break;
                }
                case "layer": {
                    // Model für ein Layer
                    nodeView = new LayerView({model: model});
                    break;
                }
                case "item": {
                    // Model für Tools/Links/andere Funktionen
                    nodeView = new ItemView({model: model});
                    break;
                }
            }
            this.$el.append(nodeView.render().el);
        }
    });

    return ListView;
});
