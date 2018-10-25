import listView from "./listViewMain";
import DesktopThemenFolderView from "./folder/viewTree";
import CatalogFolderView from "./folder/viewCatalog";
import DesktopLayerView from "./layer/view";
import SelectionView from "./layer/viewSelection";

const Menu = listView.extend({
    initialize: function () {
        this.collection = Radio.request("ModelList", "getCollection");

        Radio.on("Autostart", "startModul", this.startModul, this);
        this.listenTo(this.collection, {
            "updateOverlayerView": function (parentId) {
                this.updateOverlayer(parentId);
            },
            "updateSelection": function (model) {
                this.trigger("updateLightTree");
                this.renderSelectedList(model);
            },
            "renderTree": function () {
                this.render();
            }
        });
        this.renderMain();
        this.render();
        this.renderSelectedList();
        Radio.trigger("Autostart", "initializedModul", "tree");
    },
    render: function () {
        $("#tree").html("");
        // Eine Themenebene rendern
        this.renderSubTree("tree", 0, 0, true);
        $("ul#tree ul#Overlayer").addClass("LayerListMaxHeight");
        $("ul#tree ul#SelectedLayer").addClass("LayerListMaxHeight");
        $("ul#tree ul#Baselayer").addClass("LayerListMaxHeight");
    },
    /**
     * Rendert die  Auswahlliste
     * @return {[type]} [description]
     */
    renderSelectedList: function () {
        var selectedLayerModel = this.collection.findWhere({id: "SelectedLayer"}),
            selectedModels;

        $("#SelectedLayer").html("");
        if (selectedLayerModel.get("isExpanded")) {
            selectedModels = this.collection.where({isSelected: true, type: "layer"});

            selectedModels = _.sortBy(selectedModels, function (model) {
                return model.get("selectionIDX");
            });
            this.addSelectionView(selectedModels);
        }
    },
    /**
     * Rendert rekursiv alle Themen unter ParentId bis als rekursionsstufe Levellimit erreicht wurde
     * @param {string} parentId -
     * @param {number} level -
     * @param {number} levelLimit -
     * @param {boolean} firstTime -
     * @returns {void}
     */
    renderSubTree: function (parentId, level, levelLimit, firstTime) {
        var lightModels,
            models,
            folders,
            layer;

        if (level > levelLimit) {
            return;
        }

        lightModels = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId});
        models = this.collection.add(lightModels);

        // Ordner öffnen, die initial geöffnet sein sollen
        if (parentId === "tree") {
            _.each(models, function (model) {
                if (model.get("type") === "folder" && model.get("isInitiallyExpanded")) {
                    model.setIsExpanded(true);
                }
            });
        }

        if (level === 0 && firstTime !== true) {
            this.collection.setVisibleByParentIsExpanded(parentId);
        }

        layer = _.filter(models, function (model) {
            return model.get("type") === "layer";
        });

        // Layer Atlas sortieren
        if (Radio.request("Parser", "getTreeType") === "default") {
            layer = _.sortBy(layer, function (item) {
                return item.get("name");
            });
        }
        // Notwendig, da jQuery.after() benutzt werden muss wenn die Layer in den Baum gezeichnet werden, um den Layern auf allen Ebenen die volle Breite des Baumes zu geben
        // Mit jQuery.append würden sie ab der 2. ebene immer mit dem Eltern element zusammen eingerückt werden
        layer.reverse();

        this.addOverlayViews(layer);

        folders = _.filter(models, function (model) {
            return model.get("type") === "folder";
        });

        if (Radio.request("Parser", "getTreeType") === "default" && parentId !== "Overlayer" && parentId !== "tree") {
            folders = _.sortBy(folders, function (item) {
                return item.get("name");
            });
        }

        if (parentId !== "Overlayer" && parentId !== "tree") {
            folders.reverse();
        }

        this.addOverlayViews(folders);

        _.each(folders, function (folder) {
            this.renderSubTree(folder.get("id"), level + 1, levelLimit, false);
        }, this);
    },
    updateOverlayer: function (parentId) {
        this.renderSubTree(parentId, 0, 0, false);
    },
    addViewsToItemsOfType: function (type, items, parentId) {
        var viewItems = _.filter(items, function (model) {
            return model.get("type") === type;
        });

        if (Radio.request("Parser", "getTreeType") === "default" && parentId !== "tree") {
            viewItems = _.sortBy(viewItems, function (item) {
                return item.get("name");
            });
            if (parentId !== "Overlayer") {
                viewItems.reverse();
            }
        }

        this.addOverlayViews(items);
        return items;
    },
    addOverlayViews: function (models) {
        _.each(models, function (model) {
            if (model.get("type") === "folder") {
                // Oberste ebene im Themenbaum?
                if (model.get("parentId") === "tree") {
                    new CatalogFolderView({model: model});
                }
                else {
                    new DesktopThemenFolderView({model: model});
                }
            }
            else {
                new DesktopLayerView({model: model});
            }
        }, this);
    },
    addSelectionView: function (models) {
        _.each(models, function (model) {
            new SelectionView({model: model});
        }, this);
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

export default Menu;
