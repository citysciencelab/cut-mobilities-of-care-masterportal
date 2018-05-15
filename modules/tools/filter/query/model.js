define(function (require) {

    var SnippetDropdownModel = require("modules/snippets/dropdown/model"),
        SnippetSliderModel = require("modules/snippets/slider/model"),
        SnippetCheckboxModel = require("modules/snippets/checkbox/model"),
        QueryModel;

    QueryModel = Backbone.Model.extend({

        defaults: {
            featureIds: [],
            isLayerVisible: false,
            activateOnSelection: false,
            // flag for the search in the current map extent
            searchInMapExtent: false,
            liveZoomToFeatures: false
        },

        /**
         * kann von erbenen Objekten augerufen werden
         */
        superInitialize: function () {
            this.setSnippetCollection(new Backbone.Collection());
            this.addIsActiveCheckbox();
            this.listenTo(this.getSnippetCollection(), {
                "valuesChanged": function () {
                    this.setIsActive(true);
                    this.getBtnIsActive().setIsSelected(true);
                    this.runFilter();
                    if (this.getLiveZoomToFeatures()) {
                        Radio.trigger("Map", "zoomToFilteredFeatures", this.getFeatureIds(), this.getLayerId());
                    }
                }
            }, this);
            this.checkLayerVisibility();
            this.listenTo(Radio.channel("Layer"), {
                "layerVisibleChanged": function (layerId, visible) {
                    if (layerId === this.getLayerId()) {
                        this.setIsLayerVisible(visible);
                    }
                }
            }, this);

        },

        isSearchInMapExtentActive: function () {
            var model = this.getSnippetCollection().findWhere({type: "searchInMapExtent"});

            if (!_.isUndefined(model) && model.getIsSelected() === true) {
                this.runFilter();
            }
        },

        checkLayerVisibility: function () {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.getLayerId()});

            if (!_.isUndefined(model)) {
                this.setIsLayerVisible(model.getIsVisibleInMap());
            }
        },

        addIsActiveCheckbox: function () {
            if (!this.getActivateOnSelection()) {
                this.setBtnIsActive(new SnippetCheckboxModel({
                    isSelected: this.getIsActive()
                }));

                this.listenTo(this.getBtnIsActive(), {
                    "valuesChanged": function () {
                        var checkboxModel = this.getBtnIsActive(),
                        isActive = this.getBtnIsActive().getIsSelected();

                        checkboxModel.renderView();
                        this.setIsActive(isActive);
                    }
                }, this);
            }
        },

        /**
         * [description]
         * @param  {[type]} featureAttributesMap [description]
         * @return {[type]}                      [description]
         */
        addSnippets: function (featureAttributesMap) {
            _.each(featureAttributesMap, function (featureAttribute) {
                this.addSnippet(featureAttribute);
            }, this);
        },

        addSnippet: function (featureAttribute) {
            featureAttribute.values.sort();
            if (featureAttribute.type === "string" || featureAttribute.type === "text") {
                featureAttribute = _.extend(featureAttribute, {"snippetType": "dropdown"});
                this.getSnippetCollection().add(new SnippetDropdownModel(featureAttribute));
            }
            else if (featureAttribute.type === "boolean") {
                featureAttribute = _.extend(featureAttribute, {"snippetType": "dropdown"});
                this.getSnippetCollection().add(new SnippetDropdownModel(featureAttribute));
            }
            else if (featureAttribute.type === "integer" || featureAttribute.type === "decimal") {
                featureAttribute = _.extend(featureAttribute, {"snippetType": "slider"});
                this.getSnippetCollection().add(new SnippetSliderModel(featureAttribute));
            }
        },

        /**
         * adds a snippet for the map extent search
         * @return {[type]} [description]
         */
        addSearchInMapExtentSnippet: function () {
            this.getSnippetCollection().add(new SnippetCheckboxModel({
                type: "searchInMapExtent",
                isSelected: false,
                label: "Suche im aktuellen Kartenausschnitt"
            }));
        },

        /**
         * Creates one or more Snippets, where Snippets like DropDowns or Sliders
         * @param  {object[]} featureAttributes
         */
        createSnippets: function (featureAttributes) {
            var featureAttributesMap = this.trimAttributes(featureAttributes);

            featureAttributesMap = this.mapDisplayNames(featureAttributesMap);
            featureAttributesMap = this.collectSelectableOptions(this.getFeatures(), [], featureAttributesMap);
            featureAttributesMap = this.mapRules(featureAttributesMap, this.getRules());
            this.setFeatureAttributesMap(featureAttributesMap);
            this.addSnippets(featureAttributesMap);
            if (this.getIsSelected() === true) {
                this.runFilter();
                if (this.getLiveZoomToFeatures()) {
                    Radio.trigger("Map", "zoomToFilteredFeatures", this.getFeatureIds(), this.getLayerId());
                }
                this.trigger("renderDetailView");
            }
        },

        /**
         * Entfernt alle Attribute die nicht in der Whitelist stehen
         * @param  {object} featureAttributesMap - Mapobject
         * @return {object} featureAttributesMap - gefiltertes Mapobject
         */
         trimAttributes: function (featureAttributesMap) {
             var trimmedFeatureAttributesMap = [],
                 featureAttribute;

             _.each(this.getAttributeWhiteList(), function (attr) {
                 featureAttribute = _.findWhere(featureAttributesMap, {name: attr});
                 if (featureAttribute !== undefined) {
                     trimmedFeatureAttributesMap.push(featureAttribute);
                 }
             });

             return trimmedFeatureAttributesMap;
         },

        /**
         * Konfigurierter Labeltext wird den Features zugeordnet
         * @param  {object} featureAttributesMap - Mapobject
         * @return {object} featureAttributesMap - gefiltertes Mapobject
         */
        mapDisplayNames: function (featureAttributesMap) {
            var displayNames = Radio.request("RawLayerList", "getDisplayNamesOfFeatureAttributes", this.getLayerId());

            _.each(featureAttributesMap, function (featureAttribute) {
                if (_.isObject(displayNames) === true && _.has(displayNames, featureAttribute.name) === true) {
                    featureAttribute.displayName = displayNames[featureAttribute.name];
                }
                else {
                    featureAttribute.displayName = featureAttribute.name;
                }
            });

            return featureAttributesMap;
        },

        /**
         * adds values that should be initially selected (rules) to the map object
         * @param  {object} featureAttributesMap - Mapobject
         * @param  {object} rules - contains values to be added
         * @return {object} featureAttributesMap
         */
        mapRules: function (featureAttributesMap, rules) {
            _.each(rules, function (rule) {
                var attrMap = _.findWhere(featureAttributesMap, {name: rule.attrName});

                attrMap.initSelectedValues = rule.values;
            });

            return featureAttributesMap;
        },

        /**
         * iterates over the snippet collection and
         * calls in the snippet deselectValueModels
         */
        deselectAllValueModels: function () {
            _.each(this.getSnippetCollection().models, function (snippet) {
                snippet.deselectValueModels();
            }, this);
        },

        setFeatureAttributesMap: function (value) {
            this.set("featureAttributesMap", value);
        },

        // setter for isDefault
        setIsDefault: function (value) {
            this.set("isDefault", value);
        },
        selectThis: function () {
            if (!this.getIsSelected()) {
                // die Query-Collection hört im Filter-Model auf diesen Trigger
                this.collection.trigger("deselectAllModels", this);
                this.collection.trigger("deactivateAllModels", this);
                this.setIsSelected(true);
                if (this.getIsActive()) {
                    this.runFilter();
                }
            }
        },

        setIsSelected: function (value) {
            if (this.getActivateOnSelection()) {
                this.setIsActive(value);
            }
            this.set("isSelected", value);
        },
        getIsSelected: function () {
            return this.get("isSelected");
        },

        setIsActive: function (value) {
            this.set("isActive", value);
        },
        getIsActive: function () {
            return this.get("isActive");
        },

        setFeatureIds: function (value) {
            this.set("featureIds", value);
        },
        getFeatureIds: function () {
            return this.get("featureIds");
        },
        setIsNoValueSelected: function (value) {
            this.set("isNoValueSelected", value);
        },
        setIsLayerVisible: function (value) {
            this.set("isLayerVisible", value);
        },

        setActivateOnSelection: function (value) {
            this.set("activateOnSelection", value);
        },
        getActivateOnSelection: function () {
            return this.get("activateOnSelection");
        },

        // getter for snippetCollection
        getSnippetCollection: function () {
            return this.get("snippetCollection");
        },
        // setter for snippetCollection
        setSnippetCollection: function (value) {
            this.set("snippetCollection", value);
        },

        // getter for btnIsActive
        getBtnIsActive: function () {
            return this.get("btnIsActive");
        },
        // setter for btnIsActive
        setBtnIsActive: function (value) {
            this.set("btnIsActive", value);
        },

        // getter for liveZoomToFeatures
        getLiveZoomToFeatures: function () {
            return this.get("liveZoomToFeatures");
        },
        // setter for liveZoomToFeatures
        setLiveZoomToFeatures: function (value) {
            this.set("liveZoomToFeatures", value);
        },

        // getter for layerId
        getLayerId: function () {
            return this.get("layerId");
        },
        // setter for layerId
        setLayerId: function (value) {
            this.set("layerId", value);
        },

        // getter for features
        getFeatures: function () {
            return this.get("features");
        },
        // setter for features
        setFeatures: function (value) {
            this.set("features", value);
        },

        // getter for rules
        getRules: function () {
            return this.get("rules");
        },
        // setter for rules
        setRules: function (value) {
            this.set("rules", value);
        },

        // getter for attributeWhiteList
        getAttributeWhiteList: function () {
            return this.get("attributeWhiteList");
        },
        // setter for attributeWhiteList
        setAttributeWhiteList: function (value) {
            this.set("attributeWhiteList", value);
        }
    });

    return QueryModel;
});
