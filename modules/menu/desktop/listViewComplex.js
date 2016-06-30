define([
    "backbone.radio",
    "modules/menu/desktop/listViewMain",
    "modules/menu/desktop/folder/themenView",
    "modules/menu/desktop/folder/catalogView",
    "modules/menu/desktop/layer/selectionView",
    "modules/menu/desktop/layer/view"
    ], function () {
        var listView = require("modules/menu/desktop/listViewMain"),
            DesktopThemenFolderView = require("modules/menu/desktop/folder/themenView"),
            CatalogFolderView = require("modules/menu/desktop/folder/catalogView"),
            DesktopLayerView = require("modules/menu/desktop/layer/view"),
            SelectionView = require("modules/menu/desktop/layer/selectionView"),
            Radio = require("backbone.radio"),
            Menu;

        Menu = listView.extend({
            initialize: function () {
                listView.prototype.initialize.apply(this, arguments);

                this.listenTo(this.collection,
                {
                    "updateOverlayerView": function () {
                        this.updateOverlayer();
                    },
                    "updateSelection": function () {
                        this.updateLightTree("Themen");
                        this.renderSelectedList("Overlayer");
                    }
                });
                this.render();
            },
            render: function () {
                $("#" + "Themen").html("");
                this.renderSubTree("Themen", 0, 3);
                this.renderSelectedList();
                $("ul#Themen ul#Overlayer").css("max-height", "80vh");
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
            updateOverlayer: function () {
                $("#" + "Overlayer").html("");
                this.renderSubTree("Overlayer", 0, 3);
            },
            addViewsToItemsOfType: function (type, items, parentId) {
                items = _.filter(items, function (model) {
                    return model.getType() === type;
                });

                if (Radio.request("Parser", "getTreeType") === "default" && parentId !== "Themen") {
                    items = _.sortBy(items, function (item) {
                        return item.getName();
                    });
                    if (parentId !== "Overlayer") {
                        items.reverse();
                    }
                }

                this.addOverlayViews(items);
                return items;
            },
            addOverlayViews: function (models) {
                _.each(models, function (model) {
                    if (model.getType() === "folder") {
                        // Oberste ebene im Themenbaum?
                        if (model.getParentId() === "Themen") {
                            new CatalogFolderView({model: model});
                        }
                        else {
                            new DesktopThemenFolderView({model: model});
                        }
                    }
                    else {
                        new DesktopLayerView({model: model});
                    }
                });
            },
            addSelectionView: function (models) {
                _.each(models, function (model) {
                    new SelectionView({model: model});
                });
            }
        });
        return Menu;
    }
);
