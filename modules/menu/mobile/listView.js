define([
    "backbone",
    "backbone.radio",
    "bootstrap/dropdown",
    "bootstrap/collapse",
    "modules/menu/mobile/folder/view",
    "modules/menu/mobile/layer/view",
    "modules/menu/mobile/layer/viewLight",
    "modules/menu/mobile/tool/view",
    "modules/menu/mobile/breadCrumb/listView",
    "jqueryui/effect",
    "jqueryui/effect-slide"
    ],
    function () {
        var Backbone = require("backbone"),
            Radio = require("backbone.radio"),
            FolderView = require("modules/menu/mobile/folder/view"),
            LayerView = require("modules/menu/mobile/layer/view"),
            LayerViewLight = require("modules/menu/mobile/layer/viewLight"),
            ToolView = require("modules/menu/mobile/tool/view"),
            BreadCrumbListView = require("modules/menu/mobile/breadCrumb/listView"),
            Menu;

        Menu = Backbone.View.extend({
            collection: {},
            el: "nav#main-nav",
            attributes: {role: "navigation"},
            initialize: function () {
                this.collection = Radio.request("ModelList", "getCollection");
                this.listenTo(this.collection,
                {
                    "updateTreeView": function (slideDirection) {
                        this.renderListWithAnimation(slideDirection);
                    }
                });
                this.render();
                new BreadCrumbListView();
            },
            render: function () {
                $("div.collapse.navbar-collapse ul.nav-menu").removeClass("nav navbar-nav desktop");
                $("div.collapse.navbar-collapse ul.nav-menu").addClass("list-group mobile");
                var rootModels = this.collection.where({parentId: "root"});
                this.addViews(rootModels);
            },
            renderListWithAnimation: function (slideDirection) {
            var visibleModels = this.collection.where({isVisibleInTree: true}),
                modelsInSelection = this.collection.where({isInSelection: true}),
                slideOut = (slideDirection === "slideBack") ? "right" : "left",
                slideIn = (slideDirection === "slideForward") ? "right" : "left",
                that = this;

                $("div.collapse.navbar-collapse ul.nav-menu").effect("slide", {direction: slideOut, duration: 200, mode: "hide"}, function () {
                    $("div.collapse.navbar-collapse ul.nav-menu").html("");
                    if (modelsInSelection.length) {
                        visibleModels = _.sortBy(visibleModels, function (layer) {
                            return layer.getSelectionIDX();
                        });
                        that.addViews(visibleModels.reverse());
                    }
                    else {
                        that.addViews(visibleModels);
                    }
                });
                $("div.collapse.navbar-collapse ul.nav-menu").effect("slide", {direction: slideIn, duration: 200, mode: "show"});
            },
            addViews: function (models) {
                var nodeView, treeType = Radio.request("Parser", "getTreeType");

                _.each(models, function (model) {
                    switch (model.getType()){
                        case "folder": {
                            nodeView = new FolderView({model: model});
                            break;
                        }
                        case "tool": {
                            nodeView = new ToolView({model: model});
                            break;
                        }
                        case "layer": {
                            nodeView = (treeType === "light"? new LayerViewLight({model: model}) : new LayerView({model: model}));
                            break;
                        }
                    }
                    $("div.collapse.navbar-collapse ul.nav-menu").append(nodeView.render().el);
                });
            }
        });
        return Menu;
    }
);
