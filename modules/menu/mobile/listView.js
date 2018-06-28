define(function (require) {
    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        FolderView = require("modules/menu/mobile/folder/view"),
        LayerView = require("modules/menu/mobile/layer/view"),
        LayerViewLight = require("modules/menu/mobile/layer/viewLight"),
        ToolView = require("modules/menu/mobile/tool/view"),
        StaticLinkView = require("modules/menu/mobile/staticlink/view"),
        BreadCrumbListView = require("modules/menu/mobile/breadCrumb/listView"),
        $ = require("jquery"),
        Menu;

    require("jqueryui/effects/effect-slide");
    require("jqueryui/effect");
    require("bootstrap/dropdown");
    require("bootstrap/collapse");


    Menu = Backbone.View.extend({
        collection: {},
        el: "nav#main-nav",
        attributes: {role: "navigation"},
        breadCrumbListView: {},
        initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");
            Radio.on("Autostart", "startModul", this.startModul, this);
            this.listenTo(this.collection, {
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
            var models = [],
                lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: "tree"});

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
            var models = this.collection.where({isSelected: true, type: "layer"});

            models = _.sortBy(models, function (layer) {
                return layer.getSelectionIDX();
            }).reverse();
            if (withAnimation) {
                this.slideModels("descent", models, "tree", "Selection");
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

            if (model.getIsLeafFolder()) {
                models.push(model);
            }
            this.slideModels("descent", models, model.getParentId());
        },

        ascentInTree: function (model) {
            model.setIsVisibleInTree(false);
            var models = this.collection.where({parentId: model.getParentId()});

            this.slideModels("ascent", models, model.getId());
        },

        slideModels: function (direction, modelsToShow, parentIdOfModelsToHide, currentList) {
            var slideIn,
                slideOut,
                that = this;

            if (direction === "descent") {
                slideIn = "right";
                slideOut = "left";
            }
            else {
                slideIn = "left";
                slideOut = "right";
            }

            $("div.collapse.navbar-collapse ul.nav-menu").effect("slide", {direction: slideOut, duration: 200, mode: "hide"}, function () {

                that.collection.setModelsInvisibleByParentId(parentIdOfModelsToHide);
                // befinden wir uns in der Auswahl sind die models bereits nach ihrem SelectionIndex sortiert
                if (currentList === "Selection") {
                    that.addViews(modelsToShow);
                }
                else {
                    // Gruppieren nach Folder und Rest
                    var groupedModels = _.groupBy(modelsToShow, function (model) {
                        return (model.getType() === "folder" ? "folder" : "other");
                    });
                    // Im default-Tree werden folder und layer alphabetisch sortiert
                    if (Radio.request("Parser", "getTreeType") === "default" && modelsToShow[0].getParentId() !== "tree") {
                        groupedModels.folder = _.sortBy(groupedModels.folder, function (item) {
                            return item.getName();
                        });
                        groupedModels.other = _.sortBy(groupedModels.other, function (item) {
                            return item.getName();
                        });
                    }
                    // Folder zuerst zeichnen
                    that.addViews(groupedModels.folder);
                    that.addViews(groupedModels.other);
                }
            });
            $("div.collapse.navbar-collapse ul.nav-menu").effect("slide", {direction: slideIn, duration: 200, mode: "show"});
        },

        doRequestTreeType: function () {
            return Radio.request("Parser", "getTreeType");
        },

        doAppendNodeView: function (nodeView) {
            $("div.collapse.navbar-collapse ul.nav-menu").append(nodeView.render().el);
        },

        addViews: function (models) {
            var nodeView,
                treeType = this.doRequestTreeType();

            models = _.reject(models, function (model) {
                return model.get("onlyDesktop") === true;
            });

            _.each(models, function (model) {
                model.setIsVisibleInTree(true);
                switch (model.getType()) {
                    case "folder": {
                        var attr = model.toJSON();

                        if (attr.isLeafFolder && attr.isExpanded && !attr.isFolderSelectable) {
                            // if the selectAll-checkbox should be hidden: don't add folder-view
                            // for expanded leaf-folder -> omit empty group item.
                            return;
                        }

                        nodeView = new FolderView({model: model});

                        break;
                    }
                    case "tool": {
                        nodeView = new ToolView({model: model});
                        break;
                    }
                    case "staticlink": {
                        nodeView = new StaticLinkView({model: model});
                        break;
                    }
                    case "layer": {
                        nodeView = treeType === "light" ? new LayerViewLight({model: model}) : new LayerView({model: model});
                        break;
                    }
                    default: {
                        return;
                    }
                }
                this.doAppendNodeView(nodeView);
            }, this);
        },

        /**
         * Entfernt diesen ListView und alle subViews
         */
        removeView: function () {
            this.$el.find("ul.nav-menu").html("");

            this.breadCrumbListView.removeView();
            this.remove();
            this.collection.setAllModelsInvisible();
            $("#map").before(this.el);
        },
        startModul: function (modulId) {
            var modul = _.findWhere(this.collection.models, {id: modulId});

            if (modul.attributes.type === "tool") {
                modul.setIsActive(true);
            }
            else {
                $("#" + modulId).parent().addClass("open");
            }
        }
    });
    return Menu;
});
