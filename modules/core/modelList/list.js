define([
    "backbone",
    "backbone.radio",
    "modules/core/modelList/layer/wms",
    "modules/core/modelList/layer/wfs",
    "modules/core/modelList/folder/model",
    "modules/core/modelList/tool/model"
], function () {

    var Backbone = require("backbone"),
        WMSLayer = require("modules/core/modelList/layer/wms"),
        WFSLayer = require("modules/core/modelList/layer/wfs"),
        Folder = require("modules/core/modelList/folder/model"),
        Tool = require("modules/core/modelList/tool/model"),
        Radio = require("backbone.radio"),
        ModelList = Backbone.Collection.extend({
            initialize: function () {
               var channel = Radio.channel("ModelList");

               channel.reply({
                   "getCollection": this,
                   "getModelsByAttributes": function (attributes) {
                       return this.where(attributes);
                   }
               }, this);

                channel.on({
                    "addVisibleItems": function () {
                        this.add(Radio.request("Parser", "getItemsByAttributes", {isVisibleInMap: true}));
                    },
                    "setLayerAttributions": function (layerId, attrs) {
                       var model = this.findWhere({type: "layer", layerId: layerId});

                       if (!_.isUndefined(model)) {
                           model.set(attrs);
                       }
                   },
                   "updateList": this.updateList,
                   "checkIsExpanded": this.checkIsExpanded
               }, this);

               this.listenTo(this, {
                   "change:isActive": this.setActiveToolToFalse,
                   "change:isVisibleInMap": function () {
                       channel.trigger("sendVisiblelayerList", this.where({isVisibleInMap: true}));
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
                        // TODO muss noch gemacht werden
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
                var items = Radio.request("Parser", "getItemsByParentId", parentId);

                this.add(items);
                this.setAllModelsInvisible();
                if (parentId === "SelectedLayer") {
                    var selectedLayer = this.where({isSelected: true, type: "layer"});

                    _.each(selectedLayer, function (layer) {
                        layer.setIsVisible(true);
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
                    item.setIsVisible(true);
                });
            },

            /**
             * Setzt alle Models unsichtbar
             */
            setAllModelsInvisible: function () {
                this.forEach(function (model) {
                    model.setIsVisible(false);
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

                tool.setIsActive(false, {silent: true});
            }
    });

    return ModelList;
});
