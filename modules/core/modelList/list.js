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
        ModelList;

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
                    }
                }, this);

                channel.on({
                    "setModelAttributesById": this.setModelAttributesById,
                    "addInitialyNeededModels": this.addInitialyNeededModels,
                    "addModelsByAttributes": this.addModelsByAttributes,
                    "updateList": this.updateList,
                    "checkIsExpanded": this.checkIsExpanded,
                    "toggleIsSelectedChildLayers": this.toggleIsSelectedChildLayers,
                    "isEveryChildLayerSelected": this.isEveryChildLayerSelected
               }, this);

               this.listenTo(this, {
                   "change:isVisibleInMap": function () {
                       channel.trigger("sendVisiblelayerList", this.where({isVisibleInMap: true}));
                       channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
                   },
                   "change:isExpanded": function (model) {
                       this.toggleTreeVisibilityOfChildren(model);
                    },
                    "change:isSelected": function () {
                        this.trigger("updateSelection");
                        channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
                    },
                    "change:transparency": function () {
                        channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
                    },
                    "change:selectionIDX": function () {
                        channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
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
            * Alle Layermodels von einem Leaffolder werden "gechecked" oder "unchecked"
            * @param {Backbone.Model} model - folderModel
            */
            toggleIsSelectedChildLayers: function (model) {
                var layers = this.where({parentId: model.getId()});

                _.each(layers, function (layer) {
                    layer.setIsSelected(model.getIsSelected());
                });
            },
            /**
             * Prüft ob alle Layer im Leaffolder isSelected = true sind
             * Falls ja, wird der Leaffolder auch auf isSelected = true gesetzt
             * @param {Backbone.Model} model - layerModel
             */
            isEveryChildLayerSelected: function (model) {
                var layers = this.where({parentId: model.getParentId()}),
                   folderModel = this.findWhere({id: model.getParentId()}),
                   allLayersSelected = _.every(layers, function (layer) {
                        return layer.getIsSelected() === true;
                   });

                if (allLayersSelected === true) {
                    folderModel.setIsSelected(true);
                }
                else {
                    folderModel.setIsSelected(false);
                }
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
                if (model.getId() !== "SelectedLayer") {
                    this.trigger("updateOverlayerView");
                }
            },
            insertIntoSelectionIDX: function (model) {
                var idx = 0;

                if (this.selectionIDX.length === 0 || model.getParentId() !== "Baselayer") {
                    idx = this.appendToSelectionIDX(model);
                    // idx = this.selectionIDX.push(model) - 1;
                }
                else {
                    while (idx < this.selectionIDX.length && this.selectionIDX[idx].getParentId() === "Baselayer") {
                        idx++;
                    }
                    this.selectionIDX.splice(idx, 0, model);
                    this.updateModelIndeces();
                }
                return idx;
            },
            insertIntoSelectionIDXAt: function (model, idx) {
                this.selectionIDX.splice(idx, 0, model);
                this.updateModelIndeces();
            },
            appendToSelectionIDX: function (model) {
                var idx = this.selectionIDX.push(model) - 1;

                this.updateModelIndeces();
                return idx;
            },
            removeFromSelectionIDX: function (idx) {
                this.selectionIDX.splice(idx, 1);
                this.updateModelIndeces();
            },
            moveModelDown: function (model) {
                var oldIDX = model.getSelectionIDX(),
                    newIDX = oldIDX - 1;

                if (oldIDX > 0) {
                    this.removeFromSelectionIDX(model.getSelectionIDX());
                    this.insertIntoSelectionIDXAt(model, newIDX);
                    if (model.getIsSelected()) {
                        Radio.trigger("Map", "addLayerToIndex", [model.getLayer(), newIDX]);
                    }
                    this.trigger("updateSelection");
                    this.trigger("updateLightTree");
                }
            },
            moveModelUp: function (model) {
                var oldIDX = model.getSelectionIDX(),
                    newIDX = oldIDX + 1;

                if (oldIDX < this.selectionIDX.length - 1) {
                    this.removeFromSelectionIDX(model.getSelectionIDX());
                    this.insertIntoSelectionIDXAt(model, newIDX);
                    // Auch wenn die Layer im simple Tree noch nicht selected wurde, können
                    // die Settings angezeigt werden. Das Layer objekt wurden dann jedoch noch nicht erzeugtt und ist undefined
                    if (model.getIsSelected()) {
                        Radio.trigger("Map", "addLayerToIndex", [model.getLayer(), newIDX]);
                    }
                    this.trigger("updateSelection");

                    this.trigger("updateLightTree");
                }
            },
            updateModelIndeces: function () {
                _.each(this.selectionIDX, function (model, index) {
                    model.setSelectionIDX(index);
                });
            },

            /**
             * Setzt bei allen Models vom Typ "layer" das Attribut "isSettingVisible"
             * @param {boolean} value
             */
            setIsSettingVisible: function (value) {
                var models = this.where({type: "layer"});

                _.each(models, function (model) {
                    model.setIsSettingVisible(value);
                });
            },
            /**
             * Im Lighttree alle Models hinzufügen ansonsten, die Layer die initial
             * angezeigt werden sollen.
             */
            addInitialyNeededModels: function () {
                // lighttree: Alle models gleich hinzufügen, weil es nicht viele sind und sie direkt einen Selection index
                // benötigen, der ihre Reihenfolge in der Config Json entspricht und nicht der Reihenfolge
                // wie sie hinzugefügt werden
                if (Radio.request("Parser", "getTreeType") === "light") {
                    var lightModels = Radio.request("Parser", "getItemsByAttributes", {type: "layer"});

                    lightModels.reverse();
                    this.add(lightModels);
                    // Parametrisierter Aufruf im lighttree
                    if (_.isUndefined(Radio.request("ParametricURL", "getLayerParams")) === false) {
                        _.each(Radio.request("ParametricURL", "getLayerParams"), function (param) {
                            this.setModelAttributesById(param.id, {isVisibleInMap: true});
                        }, this);
                    }
                }
                // Parametrisierter Aufruf
                else if (_.isUndefined(Radio.request("ParametricURL", "getLayerParams")) === false) {
                    _.each(Radio.request("ParametricURL", "getLayerParams"), function (param) {
                        var lightModel = Radio.request("Parser", "getItemByAttributes", {id: param.id});

                        lightModel.isSelected = true;
                        this.add(lightModel);
                        if (param.visibility === "TRUE") {
                            this.setModelAttributesById(param.id, {isVisibleInMap: true, transparency: param.transparency});
                        }
                        else {
                            this.setModelAttributesById(param.id, {isVisibleInMap: false, transparency: param.transparency});
                        }
                    }, this);
                }
                // Only Add models in selection
                else {
                    this.addModelsByAttributes({type: "layer", isSelected: true});
                }
            },
            addModelsByAttributes: function (attrs) {
                var lightModels = Radio.request("Parser", "getItemsByAttributes", attrs);

                return this.add(lightModels);
            },
            setModelAttributesById: function (id, attrs) {
                var model = this.get(id);

                model.set(attrs);
            }
    });

    return ModelList;
});
