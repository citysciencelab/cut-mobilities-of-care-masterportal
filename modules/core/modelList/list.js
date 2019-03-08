import WMSLayer from "./layer/wms";
import WFSLayer from "./layer/wfs";
import StaticImageLayer from "./layer/staticImage";
import GeoJSONLayer from "./layer/geojson";
import GROUPLayer from "./layer/group";
import SensorLayer from "./layer/sensor";
import HeatmapLayer from "./layer/heatmap";
import TerrainLayer from "./layer/terrain";
import TileSetLayer from "./layer/tileset";
import ObliqueLayer from "./layer/oblique";
import Folder from "./folder/model";
import Tool from "./tool/model";
import StaticLink from "./staticlink/model";
import Legend from "../../legend/model";
import Filter from "../../tools/filter/model";
import PrintV2 from "../../tools/print_/model";
import Print from "../../tools/print/model";
import Measure from "../../tools/measure/model";
import Draw from "../../tools/draw/model";
import Download from "../../tools/download/model";
import Animation from "../../tools/pendler/animation/model";
import Lines from "../../tools/pendler/lines/model";
import Contact from "../../tools/contact/model";
import SearchByCoord from "../../tools/searchByCoord/model";
import SaveSelection from "../../tools/saveSelection/model";
import KmlImport from "../../tools/kmlimport/model";
import Routing from "../../tools/viomRouting/model";
import WfsFeatureFilter from "../../wfsfeaturefilter/model";
import TreeFilter from "../../treefilter/model";
import ExtendedFilter from "../../tools/extendedFilter/model";
import Formular from "../../formular/grenznachweis";
import FeatureLister from "../../featureLister/model";
import AddWms from "../../tools/addwms/model";
import GetCoord from "../../tools/getCoord/model";
import Shadow from "../../tools/shadow/model";
import Schulwegrouting from "../../tools/schulwegRouting_hh/model";
import CompareFeatures from "../../tools/compareFeatures/model";
import Einwohnerabfrage_HH from "../../tools/einwohnerabfrage_hh/model";
import ParcelSearch from "../../tools/parcelSearch/model";
import StyleWMS from "../../tools/styleWMS/model";
import LayersliderModel from "../../tools/layerslider/model";
import GFI from "../../tools/gfi/model";
import Viewpoint from "./viewpoint/model";

const ModelList = Backbone.Collection.extend(
    /** @lends List.prototype */
    {
    /**
     * @class List
     * @description Collection that manages all models.
     * Models can be of type folder, layer, staticlink, tool, viewpoint, ...
     * @extends Backbone.Collection
     * @memberOf ModelList
     * @constructs
     * @listens List#RadioRequestModelListGetCollection
     * @listens List#RadioRequestModelListGetModelsByAttributes
     * @listens List#RadioRequestModelListGetModelByAttributes
     * @listens List#RadioTriggerModelListSetModelAttributesById
     * @listens List#RadioTriggerModelListShowAllFeatures
     * @listens List#RadioTriggerModelListHideAllFeatures
     * @listens List#RadioTriggerModelListShowFeaturesById
     * @listens List#RadioTriggerModelListRemoveModelsByParentId
     * @listens List#RadioTriggerModelListAddInitialyNeededModels
     * @listens List#RadioTriggerModelListAddModelsByAttributes
     * @listens List#RadioTriggerModelListSetIsSelectedOnChildLayers
     * @listens List#RadioTriggerModelListSetIsSelectedOnParent
     * @listens List#RadioTriggerModelListShowModelInTree
     * @listens List#RadioTriggerModelListCloseAllExpandedFolder
     * @listens List#RadioTriggerModelListSetAllDescendantsInvisible
     * @listens List#RadioTriggerModelListToggleWfsCluster
     * @listens List#RadioTriggerModelListRenderTree
     * @listens List#RadioTriggerModelListToggleDefaultTool
     * @listens List#ChangeIsVisibleInMap
     * @listens List#ChangeIsExpanded
     * @listens List#ChangeIsSelected
     * @listens List#ChangeTransparency
     * @listens List#ChangeSelectionIDX
     * @fires List#RadioTriggerModelListUpdateVisibleInMapList
     * @fires List#RadioTriggerModelListUpdatedSelectedLayerList
     * @fires List#UpdateOverlayerView
     * @fires List#UpdateSelection
     * @fires List#TraverseTree
     * @fires List#RenderTree
     *
     */
        initialize: function () {
            var channel = Radio.channel("ModelList");

            channel.reply({
                "getCollection": this,
                "getModelsByAttributes": function (attributes) {
                    return this.where(attributes);
                },
                "getModelByAttributes": function (attributes) {
                    return !_.isUndefined(this.findWhere(attributes)) ? this.findWhere(attributes) : this.retrieveGroupModel(attributes);
                }
            }, this);

            channel.on({
                "setModelAttributesById": this.setModelAttributesById,
                "showAllFeatures": this.showAllFeatures,
                "hideAllFeatures": this.hideAllFeatures,
                "showFeaturesById": this.showFeaturesById,
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
                },
                "toggleWfsCluster": this.toggleWfsCluster,
                "toggleDefaultTool": this.toggleDefaultTool,
                "refreshLightTree": this.refreshLightTree
            }, this);

            this.listenTo(this, {
                "change:isVisibleInMap": function () {
                    channel.trigger("updateVisibleInMapList");
                    channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
                },
                "change:isExpanded": function (model) {
                    this.trigger("updateOverlayerView", model.get("id"));
                    if (model.get("id") === "SelectedLayer") {
                        this.trigger("updateSelection", model);
                    }
                    // Trigger fÃ¼r mobiles Wandern im Baum
                    this.trigger("traverseTree", model);
                    channel.trigger("updatedSelectedLayerList", this.where({isSelected: true, type: "layer"}));
                },
                "change:isSelected": function (model) {
                    if (model.get("type") === "layer") {
                        this.resetSelectionIdx(model);
                        model.setIsVisibleInMap(model.get("isSelected"));
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
            this.defaultToolId = Config.hasOwnProperty("defaultToolId") ? Config.defaultToolId : "gfi";
        },
        selectionIDX: [],
        model: function (attrs, options) {
            if (attrs.type === "layer") {
                if (attrs.typ === "WMS") {
                    return new WMSLayer(attrs, options);
                }
                else if (attrs.typ === "WFS") {
                    if (attrs.outputFormat === "GeoJSON") {
                        return new GeoJSONLayer(attrs, options);
                    }
                    return new WFSLayer(attrs, options);

                }
                else if (attrs.typ === "StaticImage") {
                    return new StaticImageLayer(attrs, options);
                }
                else if (attrs.typ === "GeoJSON") {
                    return new GeoJSONLayer(attrs, options);
                }
                else if (attrs.typ === "GROUP") {
                    return new GROUPLayer(attrs, options);
                }
                else if (attrs.typ === "SensorThings" || attrs.typ === "ESRIStreamLayer") {
                    return new SensorLayer(attrs, options);
                }
                else if (attrs.typ === "Heatmap") {
                    return new HeatmapLayer(attrs, options);
                }
                else if (attrs.typ === "Terrain3D") {
                    return new TerrainLayer(attrs, options);
                }
                else if (attrs.typ === "TileSet3D") {
                    return new TileSetLayer(attrs, options);
                }
                else if (attrs.typ === "Oblique") {
                    return new ObliqueLayer(attrs, options);
                }
            }
            else if (attrs.type === "folder") {
                return new Folder(attrs, options);
            }
            else if (attrs.type === "tool") {
                if (attrs.id === "print") {
                    if (attrs.version === undefined) {
                        return new Print(_.extend(attrs, {center: Radio.request("MapView", "getCenter"), proxyURL: Config.proxyURL}), options);
                    }
                    return new PrintV2(attrs, options);
                }
                else if (attrs.id === "gfi") {
                    return new GFI(_.extend(attrs, _.has(Config, "gfiWindow") ? {desktopViewType: Config.gfiWindow} : {}), options);
                }
                else if (attrs.id === "parcelSearch") {
                    return new ParcelSearch(attrs, options);
                }
                else if (attrs.id === "styleWMS") {
                    return new StyleWMS(attrs, options);
                }
                else if (attrs.id === "compareFeatures") {
                    return new CompareFeatures(attrs, options);
                }
                else if (attrs.id === "einwohnerabfrage") {
                    return new Einwohnerabfrage_HH(attrs, options);
                }
                else if (attrs.id === "legend") {
                    return new Legend(attrs, options);
                }
                else if (attrs.id === "schulwegrouting") {
                    return new Schulwegrouting(attrs, options);
                }
                else if (attrs.id === "filter") {
                    return new Filter(attrs, options);
                }
                else if (attrs.id === "coord") {
                    return new GetCoord(attrs, options);
                }
                else if (attrs.id === "shadow") {
                    return new Shadow(attrs, options);
                }
                else if (attrs.id === "measure") {
                    return new Measure(attrs, options);
                }
                else if (attrs.id === "draw") {
                    return new Draw(attrs, options);
                }
                else if (attrs.id === "download") {
                    return new Download(attrs, options);
                }
                else if (attrs.id === "searchByCoord") {
                    return new SearchByCoord(attrs, options);
                }
                else if (attrs.id === "saveSelection") {
                    return new SaveSelection(_.extend(attrs, _.has(Config, "simpleMap") ? {simpleMap: Config.simpleMap} : {}), options);
                }
                else if (attrs.id === "lines") {
                    return new Lines(attrs, options);
                }
                else if (attrs.id === "animation") {
                    return new Animation(attrs, options);
                }
                else if (attrs.id === "routing") {
                    return new Routing(attrs, options);
                }
                else if (attrs.id === "addWMS") {
                    return new AddWms(attrs, options);
                }
                else if (attrs.id === "treeFilter") {
                    return new TreeFilter(_.extend(attrs, _.has(Config, "treeConf") ? {treeConf: Config.treeConf} : {}), options);
                }
                else if (attrs.id === "contact") {
                    return new Contact(attrs, options);
                }
                else if (attrs.id === "wfsFeatureFilter") {
                    return new WfsFeatureFilter(attrs, options);
                }
                else if (attrs.id === "extendedFilter") {
                    return new ExtendedFilter(_.extend(attrs, _.has(Config, "ignoredKeys") ? {ignoredKeys: Config.ignoredKeys} : {}), options);
                }
                else if (attrs.id === "featureLister") {
                    return new FeatureLister(attrs, options);
                }
                else if (attrs.id === "kmlimport") {
                    return new KmlImport(attrs, options);
                }
                else if (attrs.id === "formular") {
                    return new Formular(attrs, options);
                }
                else if (attrs.id === "layerslider") {
                    return new LayersliderModel(attrs, options);
                }
                return new Tool(attrs, options);
            }
            else if (attrs.type === "staticlink") {
                return new StaticLink(attrs, options);
            }
            else if (attrs.type === "viewpoint") {
                return new Viewpoint(attrs, options);
            }
            else {
                Radio.trigger("Alert", "alert", "unbekannter LayerTyp " + attrs.type + ". Bitte wenden Sie sich an einen Administrator!");
            }
            return null;
        },
        getDefaultTool: function () {
            return this.get(this.defaultToolId);
        },
        /**
         * Returns the default tool of the app
         * @return {Tool} The tool with the same id as the defaultToolId
         */
        closeAllExpandedFolder: function () {
            var folderModel = this.findWhere({isExpanded: true});

            if (!_.isUndefined(folderModel)) {
                folderModel.setIsExpanded(false);
            }
        },

        /**
         * Sets all models of given parentId visibleInTree=false
         * @param {String} parentId The Id of the parent whose children should be set invisible
         * @return {void}
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
        * Sets all children visible or invisible depending on the parents attribute isExpanded
        * @param {String} parentId The Id of the parent whose children should be set visible
        * @return {void}
        */
        setVisibleByParentIsExpanded: function (parentId) {
            var parent = this.findWhere({id: parentId});

            if (!parent.get("isExpanded")) {
                this.setAllDescendantsInvisible(parentId, Radio.request("Util", "isViewMobile"));
            }
            else {
                this.setAllDescendantsVisible(parentId);
            }
        },

        /**
         * Sets all models(layer/folder/tools) of a parent id to invisible in the tree
         * in mobile mode folders are closed
         * @param {String} parentId - id of the parent model
         * @param {Boolean} isMobile - is the mobile tree visible
         * @returns {void}
         */
        setAllDescendantsInvisible: function (parentId, isMobile) {
            var children = this.where({parentId: parentId});

            _.each(children, function (child) {
                child.setIsVisibleInTree(false);
                if (child.get("type") === "folder") {
                    if (isMobile) {
                        child.setIsExpanded(false, {silent: true});
                    }
                    this.setAllDescendantsInvisible(child.get("id"), isMobile);
                }
            }, this);
        },

        /**
         * Sets all models(layer/folder/tools) of a parent id to visible in the tree
         * @param {String} parentId - id of the parent model
         * @returns {void}
         */
        setAllDescendantsVisible: function (parentId) {
            var children = this.where({parentId: parentId});

            _.each(children, function (child) {
                child.setIsVisibleInTree(true);
                if (child.get("type") === "folder" && child.get("isExpanded")) {
                    this.setAllDescendantsVisible(child.get("id"));
                }
            }, this);
        },

        /**
        * Sets all models invisible
        * @return {void}
        */
        setAllModelsInvisible: function () {
            this.forEach(function (model) {
                model.setIsVisibleInTree(false);
                if (model.get("type") === "folder") {
                    model.setIsExpanded(false, {silent: true});
                }
            });
        },
        /**
         * All layer models of a leaf folder (folder with only layers, and no folders)
         * get selected or deselected based on the parends attribute isSelected
         * @param {Folder} model - folderModel
         * @return {void}
         */
        setIsSelectedOnChildLayers: function (model) {
            var childModels = this.add(Radio.request("Parser", "getItemsByAttributes", {parentId: model.get("id")})),
                sortChildModels = this.sortLayers(childModels, "name").reverse();

            _.each(sortChildModels, function (childModel) {
                childModel.setIsSelected(model.get("isSelected"));
            });
        },

        /**
         * Sorts elements from an array by given attribute
         * @param {Layer[]} childModels Layer models to be sorted by
         * @param {String} key Attribute name to be sorted by
         * @returns {Layer[]} sorted Array
         */
        sortLayers: function (childModels, key) {
            return childModels.sort(function (firstChild, secondChild) {
                var firstValue = firstChild.get(key),
                    secondValue = secondChild.get(key),
                    direction;

                if (firstValue < secondValue) {
                    direction = -1;
                }
                else if (firstValue > secondValue) {
                    direction = 1;
                }
                else {
                    direction = 0;
                }

                return direction;
            });
        },

        /**
         * Checks if all layers in a leaffolder (folder with only layers and no other folders) are selected.
         * If so, the leaf folder is also set to isSelected=true
         * @param {Layer} model Layer model
         * @return {void}
         */
        setIsSelectedOnParent: function (model) {
            var layers = this.where({parentId: model.get("parentId")}),
                folderModel = this.findWhere({id: model.get("parentId")}),
                allLayersSelected = _.every(layers, function (layer) {
                    return layer.get("isSelected") === true;
                });

            if (allLayersSelected === true) {
                folderModel.setIsSelected(true);
            }
            else {
                folderModel.setIsSelected(false);
            }
        },

        /**
         * Sets all Tools (except the legend, and the given tool) to isActive=false
         * @param {Tool} model Tool model that has to be activated
         * @returns {void}
         */
        setActiveToolsToFalse: function (model) {
            var activeTools = _.without(this.where({isActive: true}), model),
                legendModel = this.findWhere({id: "legend"});

            activeTools = _.without(activeTools, legendModel);

            _.each(activeTools, function (tool) {
                tool.setIsActive(false);
            });
        },

        /**
         * Sets the default tool to active if no other tool (except the legend) is active
         * @return {void}
         */
        toggleDefaultTool: function () {
            var activeTools = this.where({isActive: true}),
                legendModel = this.findWhere({id: "legend"}),
                defaultTool = this.getDefaultTool();

            activeTools = _.without(activeTools, legendModel);
            if (activeTools.length === 0 && defaultTool !== undefined) {
                defaultTool.setIsActive(true);
            }
        },

        /**
         * Inserts layer model to selected layer list and returns the index of the layer model
         * @param {Layer} model Layer model that gets added to the selected layer list
         * @return {Number} idx Index of inserted layer model
         */
        insertIntoSelectionIDX: function (model) {
            var idx = 0;

            if (model.has("selectionIDX")) {
                this.selectionIDX.push(model);
                this.updateModelIndeces();
            }
            else if (this.selectionIDX.length === 0 || model.get("parentId") !== "Baselayer") {
                this.appendToSelectionIDX(model);
            }
            else {
                while (idx < this.selectionIDX.length && this.selectionIDX[idx].get("parentId") === "Baselayer") {
                    idx++;
                }
                this.selectionIDX.splice(idx, 0, model);
                this.updateModelIndeces();
            }
        },

        /**
         * Inserts layer model at given index
         * @param {Layer} model Layer model to be added
         * @param {Number} idx Index where layer model has to be added
         * @return {void}
         */
        insertIntoSelectionIDXAt: function (model, idx) {
            this.selectionIDX.splice(idx, 0, model);
            this.updateModelIndeces();
        },

        /**
         * Appends layer model to selection
         * @param {Layer} model Layer model to be added
         * @return {Number} Index where model has been added
         */
        appendToSelectionIDX: function (model) {
            var idx = this.selectionIDX.push(model) - 1;

            this.updateModelIndeces();
            return idx;
        },

        /**
         * Removes layer model at given index
         * @param {Number} idx Index of model to be removed
         * @return {void}
         */
        removeFromSelectionIDX: function (idx) {
            var deleteCid = idx.cid,
                filteredIDX = _.reject(this.selectionIDX, function (i) {
                    return i.cid === deleteCid;
                });

            this.selectionIDX = filteredIDX;
            this.updateModelIndeces();
        },

        /**
         * If the tree type is NOT "light", then the layer model gets added if isSelected=true, otherwise removed
         * @param {Layer} model Layer model
         * @fires Parser#RadioRequestParserGetTreeType
         * @return {void}
         */
        resetSelectionIdx: function (model) {
            if (Radio.request("Parser", "getTreeType") !== "light") {
                if (model.get("isSelected")) {
                    this.insertIntoSelectionIDX(model);
                }
                else {
                    this.removeFromSelectionIDX(model);
                }
            }
        },

        /**
         * Moves layer in selection one index down
         * @param {Layer} model Layer model to be pulled down
         * @fires Map#RadioTriggerMapAddLayerToIndex
         * @fires List#UpdateSelection
         * @fires List#UpdateLightTree
         * @fires List#ChangeSelectedList
         * @return {void}
         */
        moveModelDown: function (model) {
            var oldIDX = model.get("selectionIDX"),
                newIDX = oldIDX - 1;

            if (oldIDX > 0) {
                this.removeFromSelectionIDX(model);
                this.insertIntoSelectionIDXAt(model, newIDX);
                if (model.get("isSelected")) {
                    Radio.trigger("Map", "addLayerToIndex", [model.get("layer"), newIDX]);
                }
                this.trigger("updateSelection");
                this.trigger("updateLightTree");
                // Trigger fÃƒÂ¼r mobil
                this.trigger("changeSelectedList");
            }
        },

        /**
         * Moves layer in selection one index up
         * @param  {Layer} model Layer model to be pulled up
         * @fires Map#RadioTriggerMapAddLayerToIndex
         * @fires List#UpdateSelection
         * @fires List#UpdateLightTree
         * @fires List#ChangeSelectedList
         * @return {void}
         */
        moveModelUp: function (model) {
            var oldIDX = model.get("selectionIDX"),
                newIDX = oldIDX + 1;

            if (oldIDX < this.selectionIDX.length - 1) {
                this.removeFromSelectionIDX(model);
                this.insertIntoSelectionIDXAt(model, newIDX);
                // Auch wenn die Layer im simple Tree noch nicht selected wurde, kÃƒÂ¶nnen
                // die Settings angezeigt werden. Das Layer objekt wurden dann jedoch noch nicht erzeugtt und ist undefined
                if (model.get("isSelected")) {
                    Radio.trigger("Map", "addLayerToIndex", [model.get("layer"), newIDX]);
                }
                this.trigger("updateSelection");
                this.trigger("updateLightTree");
                // Trigger fÃƒÂ¼r mobil
                this.trigger("changeSelectedList");
            }
        },

        /**
         * Iterates over the models in the selection index and sets the attribute selectionIDX
         * for each model based on their index in the array
         * @return {void}
         */
        updateModelIndeces: function () {
            _.each(this.selectionIDX, function (model, index) {
                model.setSelectionIDX(index);
            });
        },

        /**
         * Sets all models that are of type "layer" the attribute isSettingVisible to given value
         * @param {Boolean} value Flag if settings have to be visible
         * @return {void}
         */
        setIsSettingVisible: function (value) {
            var models = this.where({type: "layer"});

            _.each(models, function (model) {
                model.setIsSettingVisible(value);
            });
        },

        /**
         * Adds in light tree mode all layer models. Otherwise only the layers are added that are initially set to visible
         * @fires ParametricUrl#RadioRequestParametricURLGetLayerParams
         * @fires Parser#RadioRequestParserGetTreeType
         * @fires Parser#RadioRequestParserGetItemsByAttributes
         * @fires Parser#RadioRequestParserGetItemByAttributes
         * @return {void}
         */
        addInitialyNeededModels: function () {
            // lighttree: Alle models gleich hinzufÃƒÂ¼gen, weil es nicht viele sind und sie direkt einen Selection index
            // benÃ¶tigen, der ihre Reihenfolge in der Config Json entspricht und nicht der Reihenfolge
            // wie sie hinzugefÃ¼gt werden
            var paramLayers = Radio.request("ParametricURL", "getLayerParams"),
                treeType = Radio.request("Parser", "getTreeType"),
                lightModels,
                itemIsVisibleInMap,
                lightModel;

            if (treeType === "light") {
                lightModels = Radio.request("Parser", "getItemsByAttributes", {type: "layer"});

                lightModels = this.mergeParamsToLightModels(lightModels, paramLayers);
                this.add(lightModels);
            }
            else if (paramLayers.length > 0) {
                itemIsVisibleInMap = Radio.request("Parser", "getItemsByAttributes", {isVisibleInMap: true});
                _.each(itemIsVisibleInMap, function (layer) {
                    layer.isVisibleInMap = false;
                    layer.isSelected = false;
                }, this);

                _.each(paramLayers, function (paramLayer, index) {
                    lightModel = Radio.request("Parser", "getItemByAttributes", {id: paramLayer.id});

                    if (_.isUndefined(lightModel) === false) {
                        lightModel.selectionIDX = index;
                        this.add(lightModel);
                        this.setModelAttributesById(paramLayer.id, {isSelected: true, transparency: paramLayer.transparency});
                        // selektierte Layer werden automatisch sichtbar geschaltet, daher muss hier nochmal der Layer auf nicht sichtbar gestellt werden
                        if (paramLayer.visibility === false && _.isUndefined(this.get(paramLayer.id)) === false) {
                            this.get(paramLayer.id).setIsVisibleInMap(false);
                        }
                    }
                }, this);
                this.addModelsByAttributes({typ: "Oblique"});
            }
            else {
                this.addModelsByAttributes({type: "layer", isSelected: true});
                this.addModelsByAttributes({typ: "Oblique"});
            }

        },

        /**
         * Merges layer config parameters to light models
         * @param  {Object[]} lightModels Light models requested from Parser
         * @param  {Object[]} paramLayers Parameters from parametric url
         * @return {Object[]} Light models with merged parameters
         */
        mergeParamsToLightModels: function (lightModels, paramLayers) {
            lightModels.reverse();
            // Merge die parametrisierten Einstellungen an die geparsten Models
            if (_.isUndefined(paramLayers) === false && paramLayers.length !== 0) {
                _.each(lightModels, function (lightModel) {
                    var hit = _.find(paramLayers, function (paramLayer) {
                        return paramLayer.id === lightModel.id;
                    });

                    if (hit) {
                        lightModel.isSelected = hit.visibility;
                        lightModel.transparency = hit.transparency;
                    }
                    else {
                        lightModel.isSelected = false;
                    }
                });
            }
            return lightModels;
        },

        /**
         * Sets Attributes to model with given id
         * @param {String} id Id of the model where the attributes have to be added
         * @param {Object} attrs Attributes to be added
         * @return {void}
         */
        setModelAttributesById: function (id, attrs) {
            var model = this.get(id);

            if (_.isUndefined(model) === false) {
                model.set(attrs);
            }
        },

        /**
         * Requests the light models from the parser by attributes and adds them to the collection
         * @param {Object} attrs Attributes of which the model to be added is requested from the parser and added to the collection
         * @fires Parser#RadioRequestparserGetItemsByAttributes
         * @return {void}
         */
        addModelsByAttributes: function (attrs) {
            var lightModels = Radio.request("Parser", "getItemsByAttributes", attrs);

            this.add(lightModels);
        },

        /**
         * Opens the layertree, selects the layer model and adds it to selection
         * Gets called from searchbar
         * @param {String} modelId Id of the layer model
         * @fires Map#RadioRequestMapGetMapMode
         * @fires Parser#RadioRequestParserGetItemByAttributes
         * @return {void}
        */
        showModelInTree: function (modelId) {
            var mode = Radio.request("Map", "getMapMode"),
                lightModel = Radio.request("Parser", "getItemByAttributes", {id: modelId});

            this.closeAllExpandedFolder();
            // ÃƒÂ¶ffnet den Themenbaum
            $("#root li:first-child").addClass("open");
            // Parent und eventuelle Siblings werden hinzugefÃƒÂ¼gt
            this.addAndExpandModelsRecursive(lightModel.parentId);
            if (this.get(modelId).get("supported").indexOf(mode) >= 0) {
                this.setModelAttributesById(modelId, {isSelected: true});
            }
            // Nur bei Overlayern wird in Tree gescrollt.
            if (lightModel.parentId !== "Baselayer") {
                this.scrollToLayer(lightModel.name);
            }

            // fÃ¼r DIPAS Table Ansicht
            if (Radio.request("Util", "getUiStyle") === "TABLE") {
                $("#table-nav-layers-panel").collapse("show");
            }
        },

        /**
        * Scrolls to layer in layer tree
        * @param {String} overlayername Name of Layer in "Overlayer" to be scrolled to
        * @return {void}
        */
        scrollToLayer: function (overlayername) {
            var liLayer = _.findWhere($("#Overlayer").find("span"), {title: overlayername}),
                offsetFromTop = liLayer ? $(liLayer).offset().top : null,
                heightThemen = $("#tree").css("height"),
                scrollToPx = 0;

            if (offsetFromTop) {
                // die "px" oder "%" vom string lÃƒÂ¶schen und zu int parsen
                if (heightThemen.slice(-2) === "px") {
                    heightThemen = parseInt(heightThemen.slice(0, -2), 10);
                }
                else if (heightThemen.slice(-1) === "%") {
                    heightThemen = parseInt(heightThemen.slice(0, -1), 10);
                }

                scrollToPx = (offsetFromTop - heightThemen) / 2;

                $("#Overlayer").animate({
                    scrollTop: scrollToPx
                }, "fast");
            }
        },

        /**
         * Recursive method thats starts from the bottom of the layer tree
         * Adds all models with same parentId. Then calls itself with the parentId, and so on
         * expands the parend models
         * @param {String} parentId All layer models with this parentId are added
         * @fires Parser#RadioRequestParserGetItemsByAttributes
         * @fires Parser#RadioRequestParserGetItemByAttributes
         * @return {void}
         */
        addAndExpandModelsRecursive: function (parentId) {
            var lightSiblingsModels = Radio.request("Parser", "getItemsByAttributes", {parentId: parentId}),
                parentModel = Radio.request("Parser", "getItemByAttributes", {id: lightSiblingsModels[0].parentId});

            this.add(lightSiblingsModels);
            // Abbruchbedingung
            if (_.isUndefined(parentModel) === false && parentModel.id !== "tree") {
                this.addAndExpandModelsRecursive(parentModel.parentId);
                this.get(parentModel.id).setIsExpanded(true);
            }
        },

        /**
         * Toggles the layer catalogues.
         * Every catalogue that has neither the given id, nor has isAlwaysExpanded=true gets collapsed
         * @param {String} id Id of the catalogue
         * @return {void}
         */
        toggleCatalogs: function (id) {
            _.each(this.where({parentId: "tree"}), function (model) {
                if (model.get("id") !== id && !model.get("isAlwaysExpanded")) {
                    model.setIsExpanded(false);
                }
            }, this);
        },

        /**
        * Removes all layer models from the map
        * @param {String} parentId Id of the parent folder
        * @return {void}
        */
        removeModelsByParentId: function (parentId) {
            _.each(this.where({parentId: parentId}), function (model) {
                if (model.get("type") === "layer" && model.get("isVisibleInMap") === true) {
                    model.setIsVisibleInMap(false);
                }
                model.setIsVisibleInTree(false);

                this.remove(model);
            }, this);
        },

        /**
         * Delivers groupModel by a given id
         * @param {Object|Number} attributes the id from model
         * @returns {Object} model
         */
        retrieveGroupModel: function (attributes) {
            var layerId = _.isObject(attributes) ? attributes.id : attributes,
                groupModels = this.filter(function (model) {
                    return model.get("typ") === "GROUP";
                });

            return _.find(groupModels, function (groupModel) {
                return _.find(groupModel.get("children"), function (child) {
                    return child.id === layerId;
                });
            });
        },

        /**
         * Shows all features of the vector layer model
         * @param  {String} id Id of the layer whose features have to be shown
         * @return {void}
         */
        showAllFeatures: function (id) {
            var model = this.getModelById(id);

            model.showAllFeatures();
        },

        /**
         * Shows all features of the vector layer model that match the given featureIds
         * @param  {String} id Id of vector layer model
         * @param  {String[]} featureIds Array of feature ids to be shown
         * @return {void}
         */
        showFeaturesById: function (id, featureIds) {
            var model = this.getModelById(id);

            model.showFeaturesByIds(featureIds);
        },

        /**
         * Hides all features of the vector layer model
         * @param  {String} id Id of the vector layer model
         * @return {void}
         */
        hideAllFeatures: function (id) {
            var model = this.getModelById(id);

            model.hideAllFeatures();
        },

        /**
         * Removes layer from Collection
         * @param {String} id LayerId to be removed
         * @return {void}
         */
        removeLayerById: function (id) {
            this.remove(id);
        },

        /**
         * Returns layer model by given id
         * @param {String} id Id of model to be returned
         * @returns {Layer} model
         */
        getModelById: function (id) {
            var model = this.get(id);

            if (_.isUndefined(model)) {
                model = _.find(this.retrieveGroupModel(id).get("layerSource"), function (child) {
                    return child.get("id") === id;
                });
            }
            return model;
        },

        /**
         * Sets all clustered vector layer models  the attribute isClustered to given value
         * Is used when changing the map mode
         * In 3D mode features cannot be clustered
         * @param {Boolean} value Flag if layer should be clustered or not
         * @returns {void}
         */
        toggleWfsCluster: function (value) {
            const clusterModels = this.filter(function (model) {
                return model.has("clusterDistance");
            });

            clusterModels.forEach(function (layer) {
                layer.set("isClustered", value);
            });
        },

        refreshLightTree: function () {
            this.trigger("updateLightTree");
        }
    });

export default ModelList;
