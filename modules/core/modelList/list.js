define([
    "backbone",
    "backbone.radio",
    "modules/core/modelList/layer/wms",
    "modules/core/modelList/layer/wfs",
    "modules/core/modelList/layer/group",
    "modules/core/modelList/folder/model",
    "modules/core/modelList/tool/model"
], function () {

    var Backbone = require("backbone"),
        WMSLayer = require("modules/core/modelList/layer/wms"),
        WFSLayer = require("modules/core/modelList/layer/wfs"),
        GROUPLayer = require("modules/core/modelList/layer/group"),
        Folder = require("modules/core/modelList/folder/model"),
        Tool = require("modules/core/modelList/tool/model"),
        Radio = require("backbone.radio"),
        ModelList = Backbone.Collection.extend({
            selectionIDX: [],
            initialize: function () {
               var channel = Radio.channel("ModelList");

               channel.reply({
                   "getCollection": this,
                   "getModelsByAttributes": function (attributes) {
                       return this.where(attributes);
                   },
                   "getModelByAttributes": function (attributes) {
                       return this.findWhere(attributes);
                   },
                   "getSelectionIDX": function (model) {
                       return this.insertIntoSelectionIDX(model);
                    }
               }, this);

                channel.on({
                    "setModelAttributesById": function (id, attrs) {
                        var model = this.get(id);

                        model.set(attrs);
                    },
                    "addVisibleItems": function () {
                        var visibleItems = Radio.request("Parser", "getItemsByAttributes", {isVisibleInMap: true});

                        _.each(visibleItems, function (item) {
                            _.extend(item, {selectionIDX: this.newSelectionIDX()});
                        }, this);
                        this.add(visibleItems);
                    },
                    "setLayerAttributions": function (layerId, attrs) {
                       var model = this.findWhere({type: "layer", layerId: layerId});

                       if (!_.isUndefined(model)) {
                           model.set(attrs);
                       }
                   },
                   "updateList": this.updateList,
                   "checkIsExpanded": this.checkIsExpanded,
                   "removeFromSelectionIDX": this.removeFromSelectionIDX
               }, this);

               this.listenTo(this, {
                   "change:isVisibleInMap": function () {
                       channel.trigger("sendVisiblelayerList", this.where({isVisibleInMap: true}));
                   },
                   "change:isExpanded": function (model) {
                        this.toggleTreeVisibilityOfChildren(model);
                    },
                    "change:isSelected": function () {
                        this.trigger("updateSelectionView");
                    }
               });
            },

            model: function (attrs, options) {
                if (attrs.type === "layer") {
                    if (attrs.typ === "WMS") {
                        return new WMSLayer(attrs, options);
                    }
                    else if (attrs.typ === "WFS") {
                        return new WFSLayer(attrs, options);
                    }
                    else if (attrs.typ === "GROUP") {
                        return new GROUPLayer(attrs, options);
                    }
                }
                else if (attrs.type === "folder") {
                    return new Folder(attrs, options);
                }
                else if (attrs.type === "tool") {
                    return new Tool(attrs, options);
                }
            },

            updateList: function (parentId, slideDirection) {
                var items = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId});

                this.add(items);
                this.setAllModelsInvisible();
                if (parentId === "SelectedLayer") {
                    var selectedLayer = this.where({isSelected: true, type: "layer"});

                    _.each(selectedLayer, function (layer) {
                        layer.setIsVisibleInTree(true);
                    });
                }
                else {
                    this.setModelsVisibleByParentId(parentId);
                }
                this.trigger("updateTreeView", slideDirection);
            },

            /**
             * [checkIsExpanded description]
             * @return {[type]} [description]
             */
            checkIsExpanded: function () {
                var folderModel = this.findWhere({isExpanded: true});

                if (!_.isUndefined(folderModel)) {
                    folderModel.setIsExpanded(false);
                }
            },

            /**
            * Setzt bei Änderung der Ebene, alle Model
            * auf der neuen Ebene auf sichtbar
            * @param {int} parentId Die Id des Objektes dessen Kinder angezeigt werden sollen
            */
            setModelsVisibleByParentId: function (parentId) {
                var itemListByParentId = this.where({parentId: parentId}),
                    // Falls es ein LeafFolder ist --> "Alle auswählen" Template
                    selectedLeafFolder = this.where({id: parentId, isLeafFolder: true});

                _.each(_.union(selectedLeafFolder, itemListByParentId), function (item) {
                    item.setIsVisibleInTree(true);
                });
            },

            /**
             * Setzt alle Models unsichtbar
             */
            setAllModelsInvisible: function () {
                this.forEach(function (model) {
                    model.setIsVisibleInTree(false);
                });
            },

            /**
             * Prüft ob alle Layer im Leaffolder isSelected = true sind
             * Falls ja, wird der Leaffolder auch auf isSelected = true gesetzt
             * @param {Backbone.Model} model - layerModel
             */
            everyLayerIsSelected: function (model) {
                var layers = this.where({parentId: model.getParentId()}),
                   folderModel = this.findWhere({id: model.getParentId()}),
                   allLayersChecked = _.every(layers, function (layer) {
                        return layer.getIsSelected() === true;
                   });

                if (allLayersChecked === true) {
                    folderModel.setIsSelected(true);
                }
                else {
                    folderModel.setIsSelected(false);
                }
            },

            /**
             * Steuert, ob an den Models in der Auswahl das Zahnrad angezeigt werden soll
             * dies soll nur geschehen, wenn die Auswahl gerade angezeigt wird.
             * @param {[type]} value [description]
             */
            setIsSettingVisible: function (value) {
                var models = this.where({type: "layer"});

                _.each(models, function (model) {
                    model.setIsSettingVisible(value);
                });
            },

            setActiveToolToFalse: function (model) {
                var tool = _.without(this.where({isActive: true}), model)[0];

                if (_.isUndefined(tool) === false) {
                    tool.setIsActive(false);
                }
            },

            toggleTreeVisibilityOfChildren: function (model) {
               var itemListByParentId = this.where({parentId: model.getId()});

                _.each(itemListByParentId, function (item) {
                    item.setIsVisibleInTree(!item.getIsVisibleInTree());
                });
                this.trigger("updateOverlayerView");
            },
            insertIntoSelectionIDX: function (model) {

                var idx = 0;

                if (this.selectionIDX.length === 0 || model.getParentId() !== "Baselayer") {
                    idx = this.selectionIDX.push(model) - 1;
                }
                else {
                    while (this.selectionIDX[idx].getParentId() === "Baselayer") {
                        idx++;
                    }
                    this.selectionIDX.splice(idx, 0, model);
                }
                this.updateModelIndeces();
                return idx;
            },
            removeFromSelectionIDX: function (idx) {
                this.selectionIDX.splice(idx, 1);
                this.updateModelIndeces();
            },
            updateModelIndeces: function () {
                _.each(this.selectionIDX, function (model, index) {
                    model.setSelectionIDX(index);
                });
            }
    });

    return ModelList;
});
