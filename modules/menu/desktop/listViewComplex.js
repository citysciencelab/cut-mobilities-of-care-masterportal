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
                 this.collection = Radio.request("ModelList", "getCollection");

                this.listenTo(this.collection,
                {
                    "updateOverlayerView": function (parentId) {
                        this.updateOverlayer(parentId);
                    },
                    "updateSelection": function () {
                        this.trigger("updateLightTree");
                        this.renderSelectedList("Overlayer");
                    }
                });
                this.renderMain();
                this.render();
            },
            render: function () {
                $("#" + "Themen").html("");
                this.renderSubTree("Themen", 0, 0);
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
                if (level > levelLimit) {
                    return;
                }

                var lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId}),
                    models = this.collection.add(lightModels);

                if (level === 0) {
                    this.collection.setVisibleByParentIsExpanded(parentId);
                }

                var layer = _.filter(models, function (model) {
                        return model.getType() === "layer";
                    });

                // Layer Atlas sortieren
                if (Radio.request("Parser", "getTreeType") === "default") {
                    layer = _.sortBy(layer, function (item) {
                        return item.getName();
                    });
                }
                // Notwendig, da jQuery.after() benutzt werden muss, um den Layern auf allen Ebenen die volle Breite des Baumes zu geben
                // Mit append würden sie als unter Element immer mit dem Eltern elemnt zusammen eingerückt werden
                layer.reverse();

                this.addOverlayViews(layer);

                 var folder = _.filter(models, function (model) {
                    return model.getType() === "folder";
                });

                this.addOverlayViews(folder);

                _.each(folder, function (folder) {
                    this.renderSubTree(folder.getId(), level + 1, levelLimit);
                }, this);
            },
            updateOverlayer: function (parentId) {
                this.renderSubTree(parentId, 0, 0);
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
                            this.subviews.push(new CatalogFolderView({model: model}));
                        }
                        else {
                            this.subviews.push(new DesktopThemenFolderView({model: model}));
                        }
                    }
                    else {
                        this.subviews.push(new DesktopLayerView({model: model}));
                    }
                }, this);
            },
            addSelectionView: function (models) {
                _.each(models, function (model) {
                    this.subviews.push(new SelectionView({model: model}));
                }, this);
            }
        });
        return Menu;
    }
);
