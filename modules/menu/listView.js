define([
    "backbone",
    "backbone.radio",
    "text!modules/menu/template.html",
    "text!modules/menu/desktop/template.html",
    "text!modules/menu/desktop/templateLight.html",
    "text!modules/menu/mobile/template.html",
    "modules/menu/desktop/folder/view",
    "modules/menu/desktop/folder/themenView",
    "modules/menu/desktop/layer/view",
    "modules/menu/desktop/layer/viewLight",
    "modules/menu/desktop/tool/view",
    "modules/menu/mobile/folder/view",
    "modules/menu/mobile/layer/view",
    "modules/menu/mobile/tool/view",
    "modules/menu/mobile/breadCrumb/listView",
    "bootstrap/dropdown",
    "bootstrap/collapse",
    "jqueryui/effect",
    "jqueryui/effect-slide",
    "modules/menu/desktop/folder/catalogView",
    "modules/menu/desktop/layer/selectionView"
], function () {

    var Backbone = require("backbone"),
        Radio = require("backbone.radio"),
        DesktopComplexTemplate = require("text!modules/menu/desktop/template.html"),
        DesktopLightTemplate = require("text!modules/menu/desktop/templateLight.html"),
        MobileTemplate = require("text!modules/menu/mobile/template.html"),
        DesktopFolderView = require("modules/menu/desktop/folder/view"),
        DesktopThemenFolderView = require("modules/menu/desktop/folder/themenView"),
        CatalogFolderView = require("modules/menu/desktop/folder/catalogView"),
        DesktopLayerView = require("modules/menu/desktop/layer/view"),
        DesktopLayerViewLight = require("modules/menu/desktop/layer/viewLight"),
        DesktopLayerSelectionView = require("modules/menu/desktop/layer/selectionView"),
        DesktopToolView = require("modules/menu/desktop/tool/view"),
        MobileFolderView = require("modules/menu/mobile/folder/view"),
        MobileLayerView = require("modules/menu/mobile/layer/view"),
        MobileToolView = require("modules/menu/mobile/tool/view"),
        BreadCrumbListView = require("modules/menu/mobile/breadCrumb/listView"),
        Menu;

    Menu = Backbone.View.extend({
        collection: {},
        el: "nav#main-nav",
        attributes: {role: "navigation"},
        desktopComplexTemplate: _.template(DesktopComplexTemplate),
        desktopLightTemplate: _.template(DesktopLightTemplate),
        mobileTemplate: _.template(MobileTemplate),

        initialize: function () {
            this.collection = Radio.request("ModelList", "getCollection");

            this.listenTo(this.collection,
            {
                "updateTreeView": function (slideDirection) {
                    this.renderListWithAnimation(slideDirection);
                },
                "updateOverlayerView": function () {
                    this.renderDesktopThemen("Overlayer");
                },
                "updateSelectionOrLightTreeView": function () {
                    this.updateLightTree("Themen");
                    this.renderSelectedList("Overlayer");
                }
            });

            this.render();
            if (Radio.request("Util", "isViewMobile") === true) {
                new BreadCrumbListView();
            }
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

        renderTopMenu: function (isMobile) {
            var rootModels = this.collection.where({parentId: "root"});

                this.addViews(rootModels);

           if (!isMobile) {
               // this.$el.html("");
                var toolModels = this.collection.where({parentId: "Werkzeuge"});

                this.addViews(toolModels);
            }
        },
        renderThemenMenu: function (isMobile) {
            var lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: "Themen"}),
                items = this.collection.add(lightModels);

            items = _.sortBy(items, function (item) {
                    return item.getName();
            });

            if (!isMobile) {
                var fachdaten = _.findWhere(items, {id: "Overlayer"});

                fachdaten.setIsExpanded(true);
            }
            this.addViews(items);
        },

        renderLightTree: function (parentId) {

            var lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId}),
                models = this.collection.add(lightModels);

            this.collection.initLightTreeSelectionIDX(models);
            models = _.sortBy(models, function (model) {
                return model.getSelectionIDX();
            });

            this.addViews(models);
        },
        updateLightTree: function () {
            $("#" + "Themen").html("");
            var models = this.collection.where({type: "layer"});
            models = _.sortBy(models, function (model) {
                return model.getSelectionIDX();
            });
            this.addViews(models);
        },
        /**
         * Rendert in der Desktop Ansicht den Themenbaum
         * @param  {[type]} parentId [description]
         * @return {[type]}          [description]
         */
        renderDesktopThemen: function (parentId) {
            $("#" + parentId).html("");
            this.renderSubTree(parentId, 0, 3);
        },
        /**
         * Rendert rekursiv alle Themen unter ParentId bis als rekursionsstufe Levellimit erreicht wurde
         */

        renderSubTree: function (parentId, level, levelLimit) {
            if (level >= levelLimit) {
                return;
            }

            var lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId}),
                models = this.collection.add(lightModels);

            this.addViewsToItemsOfType("layer", models);

            var folder = this.addViewsToItemsOfType("folder", models, parentId);

            _.each(folder, function (folder) {
                this.renderSubTree(folder.getId(), level + 1, levelLimit);
            }, this);
        },
        /**
         * Rendert die  Auswahlliste
         * @return {[type]} [description]
         */
        renderSelectedList: function () {
            $("#" + "SelectedLayer").html("");

           var selectedModels = this.collection.where({isSelected: true, type: "layer"});

           selectedModels = _.sortBy(selectedModels, function (model) {
                return model.getSelectionIDX();
           });
           this.addSelectionView(selectedModels);
        },
        addViewsToItemsOfType: function (type, items, parentId) {
            items = _.filter(items, function (model) {
                return model.getType() === type;
            });

            if (Radio.request("Parser", "getTreeType") === "default" || parentId === "Themen") {
                items = _.sortBy(items, function (item) {
                    return item.getName();
                });
            }
            items.reverse();
            this.addViews(items);
            return items;
        },
        render: function () {
            var isMobile = Radio.request("Util", "isViewMobile");

            if (isMobile) {
                $("div.collapse.navbar-collapse ul.nav-menu").removeClass("nav navbar-nav desktop");
                $("div.collapse.navbar-collapse ul.nav-menu").addClass("list-group mobile");
            }
            else {
                $("div.collapse.navbar-collapse ul.nav-menu").addClass("nav navbar-nav desktop");
                $("div.collapse.navbar-collapse ul.nav-menu").removeClass("list-group mobile");
            }
            this.renderTopMenu(isMobile);
            if (Radio.request("Parser", "getTreeType") !== "light") {
                if (!isMobile) {
                    this.renderThemenMenu(isMobile);
                    this.renderDesktopThemen("Baselayer");
                    this.renderDesktopThemen("Overlayer");
                    this.renderSelectedList();
                    $("ul#Themen ul#Overlayer").css("max-height", "80vh");
                }
            }
            else {
                this.renderLightTree("Themen");
            }


            // if (isMobile) {
            //     $("body").append(this.$el.append(this.mobileTemplate()));
            // }
            // else {
            //     var treeType = Radio.request("Parser", "getPortalConfig").Baumtyp;
            //
            //     if (treeType === "light") {
            //         // Use light Template
            //         $("body").append(this.$el.append(this.desktopLightTemplate()));
            //     }
            //     else {
            //         // Use complex Template
            //         $("body").append(this.$el.append(this.desktopComplexTemplate()));
            //     }
            // }
            // Radio.trigger("MenuBar", "switchedMenu");
        },

        /**
         * Ordnet den Models die richtigen Views zu.
         * @param {Backbone.Model} model - itemModel | layerModel | folderModel
         */
        addViews: function (models) {
            var isMobile = Radio.request("Util", "isViewMobile"),
                treeType = Radio.request("Parser", "getTreeType"),
                nodeView;

            _.each(models, function (model) {
                switch (model.getType()){
                    case "folder": {
                        // Model für einen Ordner

                        if (isMobile) {
                            nodeView = new MobileFolderView({model: model});
                        }
                        else {
                            if (model.getIsInThemen()) {
                                if (model.getParentId() === "Themen") {
                                    new CatalogFolderView({model: model});
                                }
                                else {
                                    new DesktopThemenFolderView({model: model});
                                }
                            }
                            else {
                                new DesktopFolderView({model: model});
                            }

                        }
                        break;
                    }
                    case "layer": {
                        // Model für ein Layer
                        if (treeType === "light") {
                            nodeView = isMobile ? new MobileLayerView({model: model}) : new DesktopLayerViewLight({model: model});
                        }
                        else {
                            nodeView = isMobile ? new MobileLayerView({model: model}) : new DesktopLayerView({model: model});
                        }
                        break;
                    }
                    case "tool": {
                         // Model für Tools/Links/andere Funktionen
                        nodeView = isMobile ? new MobileToolView({model: model}) : new DesktopToolView({model: model});
                        break;
                    }
                }
                if (isMobile) {
                    $("div.collapse.navbar-collapse ul.nav-menu").append(nodeView.render().el);
                }
            });
        },
        addSelectionView: function (models) {
            _.each(models, function (model) {
                new DesktopLayerSelectionView({model: model});
            });

        }
    });

    return Menu;
});
