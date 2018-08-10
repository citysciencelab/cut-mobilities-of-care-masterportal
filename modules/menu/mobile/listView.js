define(function (require) {
    var FolderView = require("modules/menu/mobile/folder/view"),
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
            var rootModels = this.collection.where({parentId: "root"});

            $("div.collapse.navbar-collapse ul.nav-menu").removeClass("nav navbar-nav desktop");
            $("div.collapse.navbar-collapse ul.nav-menu").addClass("list-group mobile");
            this.addViews(rootModels);
            return this;
        },

        traverseTree: function (model) {
            if (model.get("isExpanded")) {
                if (model.get("id") === "SelectedLayer") {
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
                return layer.get("selectionIDX");
            }).reverse();

            _.each(models, function (model) {
                model.setIsVisibleInTree(false);
            }, this);

            this.addViews(models);
        },

        renderSelection: function (withAnimation) {
            var models = this.collection.where({isSelected: true, type: "layer"});

            models = _.sortBy(models, function (layer) {
                return layer.get("selectionIDX");
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
                lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: model.get("id")});

            models = this.collection.add(lightModels);

            if (model.get("isLeafFolder")) {
                models.push(model);
            }
            this.slideModels("descent", models, model.get("parentId"));
        },

        ascentInTree: function (model) {
            var models = this.collection.where({parentId: model.get("parentId")});

            model.setIsVisibleInTree(false);
            this.slideModels("ascent", models, model.get("id"));
        },

        slideModels: function (direction, modelsToShow, parentIdOfModelsToHide, currentList) {
            var slideIn,
                slideOut,
                groupedModels,
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
                    groupedModels = _.groupBy(modelsToShow, function (model) {
                        return model.get("type") === "folder" ? "folder" : "other";
                    });

                    // Im default-Tree werden folder und layer alphabetisch sortiert
                    if (Radio.request("Parser", "getTreeType") === "default" && modelsToShow[0].get("parentId") !== "tree") {
                        groupedModels.folder = _.sortBy(groupedModels.folder, function (item) {
                            return item.get("name");
                        });
                        groupedModels.other = _.sortBy(groupedModels.other, function (item) {
                            return item.get("name");
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
                attr,
                treeType = this.doRequestTreeType(),
                newModels = _.reject(models, function (model) {
                    return model.get("onlyDesktop") === true;
                });

            _.each(newModels, function (model) {
                model.setIsVisibleInTree(true);
                switch (model.get("type")) {
                    case "folder": {
                        attr = model.toJSON();

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
         * @returns {void}
         */
        removeView: function () {
            this.$el.find("ul.nav-menu").html("");

            this.breadCrumbListView.removeView();
            this.remove();
            this.collection.setAllModelsInvisible();
            $("#map").before(this.el);
        },
        startModul: function (modulId) {
            var modul = this.collection.find(function (model) {
                return model.get("id").toLowerCase() === modulId;
            });

            if (modul.get("type") === "tool") {
                modul.setIsActive(true);
            }
            else {
                $("#" + modulId).parent().addClass("open");
            }
        }
    });
    return Menu;
});
