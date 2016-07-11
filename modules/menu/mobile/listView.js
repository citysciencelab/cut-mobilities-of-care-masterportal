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
            subviews: [],
            breadCrumbListView: {},
            initialize: function () {
                this.collection = Radio.request("ModelList", "getCollection");
                this.listenTo(this.collection,
                {
                    "traverseTree": this.traverseTree,
                    "changeSelectedList": function () {
                        if (Radio.request("Parser", "getTreeType") === "light") {
                            this.updateLightTree();
                        }
                        else {
                            this.renderSelection(false);
                        }
                    }
                });
                this.render();
                this.breadCrumbListView = new BreadCrumbListView();
            },
            render: function () {
                $("div.collapse.navbar-collapse ul.nav-menu").removeClass("nav navbar-nav desktop");
                $("div.collapse.navbar-collapse ul.nav-menu").addClass("list-group mobile");
                var rootModels = this.collection.where({parentId: "root"});

                this.addViews(rootModels);
            },
            traverseTree: function (model) {

                if (model.getIsExpanded()) {
                    if (model.getId() === "SelectedLayer") {
                        this.renderSelection(true);
                    }
                    else {
                        this.descentInTree(model);
                    }
                    this.breadCrumbListView.collection.addItem(model);
                }
                else {
                     this.ascentInTree(model);
                }
            },
            updateLightTree: function () {
                debugger;
                var models = [],
                lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: "Themen"});

                models = this.collection.add(lightModels);

                models = _.sortBy(models, function (layer) {
                        return layer.getSelectionIDX();
                }).reverse();

                _.each(models, function (model) {
                        model.setIsVisibleInTree(false);
                    }, this);

                this.addViews(models);
            },
            renderSelection: function (withAnimation) {
                var models = this.collection.where({isSelected: true});

                models = _.sortBy(models, function (layer) {
                        return layer.getSelectionIDX();
                }).reverse();
                if (withAnimation) {
                    this.slideModels("descent", models, "Themen");
                }
                else {
                    // Views löschen um doppeltes Zeichnen zu vermeiden
                    _.each(models, function (model) {
                        model.setIsVisibleInTree(false);
                    }, this);

                    this.addViews(models);
                }
            },
            descentInTree: function (model) {
                var models = [],
                    lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: model.getId()});

                models = this.collection.add(lightModels);
                this.slideModels("descent", models, model.getParentId());
            },
            ascentInTree: function (model) {
                var models = this.collection.where({parentId: model.getParentId()});

                this.slideModels("ascent", models, model.getId());
            },
            slideModels: function (direction, modelsToShow, parentIdOfModelsToHide) {
                var slideIn, slideOut;

                if (direction === "descent") {
                    slideIn = "right";
                    slideOut = "left";
                }
                else {
                    slideIn = "left";
                    slideOut = "right";
                }
                var that = this;

                $("div.collapse.navbar-collapse ul.nav-menu").effect("slide", {direction: slideOut, duration: 200, mode: "hide"},
                    function () {
                        that.collection.setModelsInvisibleByParentId(parentIdOfModelsToHide);
                        // Folder zuerst zeichnen
                        var groupedModels = _.groupBy(modelsToShow, function  (model) {
                            return (model.getType() === "folder"? "folder" : "other");
                        }) ;

                        that.addViews(groupedModels.folder);
                        that.addViews(groupedModels.other);
                    }
                );
                $("div.collapse.navbar-collapse ul.nav-menu").effect("slide", {direction: slideIn, duration: 200, mode: "show"});
            },
            addViews: function (models) {
                var nodeView, treeType = Radio.request("Parser", "getTreeType");

                _.each(models, function (model) {
                    model.setIsVisibleInTree(true);
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
                            nodeView = (treeType === "light" ? new LayerViewLight({model: model}) : new LayerView({model: model}));
                            break;
                        }
                    }
                    this.subviews.push(nodeView);
                    $("div.collapse.navbar-collapse ul.nav-menu").append(nodeView.render().el);
                }, this);
            },
            /**
             * Entfernt diesen ListView und alle subViews
             */
            removeView: function () {
                this.$el.find("ul.nav-menu").html("");

                this.breadCrumbListView.removeView();
                while (this.subviews.length) {
                    this.subviews.pop().remove();
                }
                this.remove();
                $("body").append(this.el);
            }
        });
        return Menu;
    }
);
