import ListViewMain from "./listViewMain";
import DesktopThemenFolderView from "./folder/viewTree";
import CatalogFolderView from "./folder/viewCatalog";
import DesktopLayerView from "./layer/view";
import SelectionView from "./layer/viewSelection";

const ListView = ListViewMain.extend(/** @lends ListView.prototype */{
    /**
     * @class ListView
     * @extends ListViewMain
     * @memberof Menu.Desktop
     * @constructs
     * @fires ModelList#RadioRequestModelListGetCollection
     * @fires ModelList#UpdateLightTree
     * @fires Autostart#RadioTriggerAutostartInitializedModul
     * @fires Parser#RadioRequestParserGetItemsByAttributes
     * @fires Parser#RadioRequestParserGetTreeType
     * @listens Autostart#RadioTriggerAutostartStartModul
     * @listens ModelList#UpdateOverlayerView
     * @listens ModelList#UpdateSelection
     * @listens ModelList#RenderTree
     */
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
    /**
     * Renders the data to DOM.
     * @return {void}
     */
    render: function () {
        $("#tree").html("");
        // Renders a Theme level
        this.renderSubTree("tree", 0, 0, true);
        $("ul#tree ul#Overlayer").addClass("LayerListMaxHeight");
        $("ul#tree ul#SelectedLayer").addClass("LayerListMaxHeight");
        $("ul#tree ul#Baselayer").addClass("LayerListMaxHeight");
    },

    /**
     * Renders the selection list
     * @return {void}
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
     * Renders all themes based on parentId recursively until all levels are reached
     * @param {string} parentId to do
     * @param {number} level to do
     * @param {number} levelLimit to do
     * @param {boolean} firstTime to do
     * @fires Parser#RadioRequestParserGetItemsByAttributes
     * @fires Parser#RadioRequestParserGetTreeType
     * @return {void}
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

        layer = models.filter(function (model) {
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

        folders = models.filter(function (model) {
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

    /**
     * Updates Overlayer
     * @param {number} parentId - ID of the parent item
     * @return {void}
     */
    updateOverlayer: function (parentId) {
        this.renderSubTree(parentId, 0, 10, false);
    },

    /**
     * Add Views to Items based on type
     * @param {number} type to do
     * @param {*} items to do
     * @param {number} parentId ID of the parent item
     * @fires Parser#RadioRequestParserGetTreeType
     * @return {Array} items
     */
    addViewsToItemsOfType: function (type, items, parentId) {
        var viewItems = items.filter(function (model) {
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

    /**
     * Add Overlay Views
     * @param {Array} models - Array of models
     * @return {void}
     */
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
            else if (!model.get("isNeverVisibleInTree")) {
                new DesktopLayerView({model: model});
            }
        }, this);
    },

    /**
     * Add Selection View
     * @param {*} models - todo
     * @return {void}
     */
    addSelectionView: function (models) {
        _.each(models, function (model) {
            if (!model.get("isNeverVisibleInTree")) {
                new SelectionView({model: model});
            }
        }, this);
    },

    /**
     * Start the List View Modul
     * @param {String} modulId to do
     * @return {void}
     */
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

export default ListView;
