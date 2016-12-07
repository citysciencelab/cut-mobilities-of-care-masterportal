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
                    },
                    "getModelByFeatureId": this.getModelByFeatureId
                }, this);

                channel.on({
                    "setModelAttributesById": this.setModelAttributesById,
                    "removeModelsByParentId": this.removeModelsByParentId,
                    // Initial sichtbare Layer etc.
                    "addInitialyNeededModels": this.addInitialyNeededModels,
                    "addModelsByAttributes": this.addModelsByAttributes,
                    "setIsSelectedOnChildLayers": this.setIsSelectedOnChildLayers,
                    "setIsSelectedOnParent": this.setIsSelectedOnParent,
                    "showModelInTree": this.showModelInTree,
                    "closeAllExpandedFolder": this.closeExpandedFolder,
                    "setAllDescendantsInvisible": this.setAllDescendantsInvisible,
                    "renderTree": function () {
                        this.trigger("renderTree");
                    }
               }, this);

               this.listenTo(this, {
                   "change:isVisibleInMap": function () {
                       channel.trigger("updateVisibleInMapList");
                       channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
                   },
                   "change:isExpanded": function (model) {
                           this.trigger("updateOverlayerView", model.getId());
                        if (model.getId() === "SelectedLayer") {
                            this.trigger("updateSelection", model);
                        }
                        // Trigger für mobiles Wandern im Baum
                        this.trigger("traverseTree", model);
                    },
                    "change:isSelected": function (model) {
                        if (model.getType() === "layer") {
                            this.resetSelectionIdx(model);
                            model.setIsVisibleInMap(model.getIsSelected());
                            model.toggleLayerOnMap();
                        }
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
            /**
             * [checkIsExpanded description]
             * @return {[type]} [description]
             */
            closeAllExpandedFolder: function () {
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
            * Setzt bei Änderung der Ebene, alle Model
            * auf der alten Ebene auf unsichtbar
            * @param {int} parentId Die Id des Objektes dessen Kinder angezeigt werden sollen
            */
            setModelsInvisibleByParentId: function (parentId) {
                var children;

                if (parentId === "SelectedLayer") {
                    children = this.where({isSelected: true});
                }
                else {
                    children = this.where({parentId: parentId});
                }
                _.each(children, function (item) {
                    item.setIsVisibleInTree(false);
                });
            },
             /**
            *
            *
            * @param {int} parentId Die Id des Objektes dessen Kinder angezeigt werden sollen
            */
            setVisibleByParentIsExpanded: function (parentId) {
                var itemListByParentId = this.where({parentId: parentId}),
                    parent = this.findWhere({id: parentId});

                if (!parent.getIsExpanded()) {
                    this.setAllDescendantsInvisible(parentId);
                }
                else {
                     _.each(itemListByParentId, function (item) {
                        item.setIsVisibleInTree(true);
                    });
                }
            },
            setAllDescendantsInvisible: function (parentId) {
                var itemListByParentId = this.where({parentId: parentId});

                _.each(itemListByParentId, function (item) {
                    item.setIsVisibleInTree(false);
                    if (item.getType() === "folder") {
                        item.setIsExpanded(false, {silent: true});
                    }
                    this.setAllDescendantsInvisible(item.getId());
                }, this);
            },

            /**
             * Setzt alle Models unsichtbar
             */
            setAllModelsInvisible: function () {
                this.forEach(function (model) {
                    model.setIsVisibleInTree(false);
                    if (model.getType() === "folder") {
                        model.setIsExpanded(false, {silent: true});
                    }
                });
            },
             /**
            * Alle Layermodels von einem Leaffolder werden "selected" oder "unselected"
            * @param {Backbone.Model} model - folderModel
            */
            setIsSelectedOnChildLayers: function (model) {
                var layers = this.add(Radio.request("Parser", "getItemsByAttributes", {parentId: model.getId()}));

                _.each(layers, function (layer) {
                    layer.setIsSelected(model.getIsSelected());
                });
            },
            /**
             * Prüft ob alle Layer im Leaffolder isSelected = true sind
             * Falls ja, wird der Leaffolder auch auf isSelected = true gesetzt
             * @param {Backbone.Model} model - layerModel
             */
            setIsSelectedOnParent: function (model) {
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

            resetSelectionIdx: function (model) {
                if (Radio.request("Parser", "getTreeType") !== "light") {
                    if (model.getIsSelected()) {
                        this.insertIntoSelectionIDX(model);
                    }
                    else {
                        this.removeFromSelectionIDX(model);
                    }
                }
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
                    // Trigger für mobil
                    this.trigger("changeSelectedList");
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
                    // Trigger für mobil
                    this.trigger("changeSelectedList");
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
                var paramLayers = Radio.request("ParametricURL", "getLayerParams"),
                    treeType = Radio.request("Parser", "getTreeType");

                if (treeType === "light") {
                    var lightModels = Radio.request("Parser", "getItemsByAttributes", {type: "layer"});

                    lightModels.reverse();
                    this.add(lightModels);
                    // Parametrisierter Aufruf im lighttree
                    _.each(paramLayers, function (paramLayer) {
                        this.setModelAttributesById(paramLayer.id, {isSelected: true, transparency: paramLayer.transparency});
                    }, this);
                }
                // Parametrisierter Aufruf
                else if (paramLayers.length > 0) {
                    _.each(paramLayers, function (paramLayer) {
                        var lightModel = Radio.request("Parser", "getItemByAttributes", {id: paramLayer.id});

                        if (_.isUndefined(lightModel) === false) {
                            this.add(lightModel);
                            if (paramLayer.visibility === true) {
                                this.setModelAttributesById(paramLayer.id, {isSelected: true, transparency: paramLayer.transparency});
                            }
                            else {
                                this.setModelAttributesById(paramLayer.id, {isSelected: true, transparency: paramLayer.transparency});
                                // selektierte Layer werden automatisch sichtbar geschaltet, daher muss hier nochmal der Layer auf nicht sichtbar gestellt werden
                                if (_.isUndefined(this.get(paramLayer.id)) === false) {
                                    this.get(paramLayer.id).setIsVisibleInMap(false);
                                }
                            }
                        }
                    }, this);
                }
                // Only Add models in selection
                else {
                    this.addModelsByAttributes({type: "layer", isSelected: true});
                }
            },

            setModelAttributesById: function (id, attrs) {
                var model = this.get(id);

                if (_.isUndefined(model) === false) {
                    model.set(attrs);
                }
            },

            addModelsByAttributes: function (attrs) {
                var lightModels = Radio.request("Parser", "getItemsByAttributes", attrs);

                this.add(lightModels);
            },

            /**
             * Wird aus der Themensuche heraus aufgerufen
             * Öffnet den Themenbaum, selektiert das Model und fügt es zur Themenauswahl hinzu
             * @param  {String} modelId
             */
            showModelInTree: function (modelId) {
                var lightModel = Radio.request("Parser", "getItemByAttributes", {id: modelId});

                this.closeAllExpandedFolder();

                // öffnet den Themenbaum
                $("#root li:first-child").addClass("open");
                // Parent und eventuelle Siblings werden hinzugefügt
                this.addAndExpandModelsRecursive(lightModel.parentId);
                this.setModelAttributesById(modelId, {isSelected: true});
                this.scrollToLayer(lightModel.name);
            },

            /**
            * Scrolled auf den Layer
            * @param {String} layername - in "Fachdaten" wird auf diesen Layer gescrolled
            */
            scrollToLayer: function (layername) {
                var liLayer = _.findWhere($("#Overlayer").find("span"), {title: layername}),
                    offsetFromTop = $(liLayer).offset().top,
                    heightThemen = $("#Themen").css("height"),
                    scrollToPx = 0;

                // die "px" oder "%" vom string löschen und zu int parsen
                if (heightThemen.slice(-2) === "px") {
                    heightThemen = parseInt(heightThemen.slice(0, -2), 10);
                }
                else if (heightThemen.slice(-1) === "%") {
                    heightThemen = parseInt(heightThemen.slice(0, -1), 10);
                }

                scrollToPx = offsetFromTop - heightThemen / 2;

                $("#Overlayer").animate({
                    scrollTop: scrollToPx
                }, "fast");
            },

            /**
            * Rekursive Methode, die von unten im Themenbaum startet
            * Fügt alle Models der gleichen Ebene zur Liste hinzu, holt sich das Parent-Model und ruft sich selbst auf
            * Beim Zurücklaufen werden die Parent-Models expanded
            * @param {String} parentId - Models mit dieser parentId werden zur Liste hinzugefügt
            */
            addAndExpandModelsRecursive: function (parentId) {
                var lightSiblingsModels = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId}),
                parentModel = Radio.request("Parser", "getItemByAttributes", {id: lightSiblingsModels[0].parentId});

                this.add(lightSiblingsModels);
                // Abbruchbedingung
                if (_.isUndefined(parentModel) === false && parentModel.id !== "Themen") {
                    this.addAndExpandModelsRecursive(parentModel.parentId);
                    this.get(parentModel.id).setIsExpanded(true);
                }
            },

            toggleCatalogs: function (id) {
                _.each(this.where({parentId: "Themen"}), function (model) {
                    if (model.getId() !== id) {
                        model.setIsExpanded(false);
                    }
                }, this);
            },

            getModelByFeatureId: function (id) {
                console.log(id);
            },

            /**
             * [removeModelsByParentId description]
             * @param  {[type]} parentId [description]
             * @return {[type]}          [description]
             */
            removeModelsByParentId: function (parentId) {
                _.each(this.where({parentId: parentId}), function (model) {
                    if (model.getType() === "layer" && model.getIsVisibleInMap() === true) {
                        model.setIsVisibleInMap(false);
                    }
                    model.setIsVisibleInTree(false);

                    this.remove(model);
                }, this);
            }
    });

    return ModelList;
});
