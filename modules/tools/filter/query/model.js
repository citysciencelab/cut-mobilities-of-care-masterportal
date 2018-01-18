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
            searchInMapExtent: false
        },

        /**
         * kann von erbenen Objekten augerufen werden
         */
        superInitialize: function () {
            this.set("snippetCollection", new Backbone.Collection());
            this.addIsActiveCheckbox();
            this.listenTo(this.get("snippetCollection"), {
                "valuesChanged": function () {
                    this.setIsActive(true);
                    this.get("btnIsActive").setIsSelected(true);
                    this.runFilter();
                }
            }, this);
            this.checkLayerVisibility();
            this.listenTo(Radio.channel("Layer"), {
                "layerVisibleChanged": function (layerId, visible) {
                    if (layerId === this.get("layerId")) {
                        this.setIsLayerVisible(visible);
                    }
                }
            }, this);

        },

        isSearchInMapExtentActive: function () {
            var model = this.get("snippetCollection").findWhere({type: "searchInMapExtent"});

            if (!_.isUndefined(model) && model.getIsSelected() === true) {
                this.runFilter();
            }
        },

        checkLayerVisibility: function () {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});

            if (!_.isUndefined(model)) {
                this.setIsLayerVisible(model.getIsVisibleInMap());
            }
        },

        addIsActiveCheckbox: function () {
            if (!this.get("activateOnSelection")) {
                this.set("btnIsActive", new SnippetCheckboxModel({
                    isSelected: this.get("isActive")
                }));

                this.listenTo(this.get("btnIsActive"), {
                    "valuesChanged": function () {
                        var checkboxModel = this.get("btnIsActive"),
                        isActive = this.get("btnIsActive").getIsSelected();

                        checkboxModel.renderView();
                        this.setIsActive(isActive);
                        this.runFilter();
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
            if (featureAttribute.type === "string") {
                featureAttribute = _.extend(featureAttribute, {"snippetType": "dropdown"});
                this.get("snippetCollection").add(new SnippetDropdownModel(featureAttribute));
            }
            else if (featureAttribute.type === "boolean") {
                featureAttribute = _.extend(featureAttribute, {"snippetType": "dropdown"});
                this.get("snippetCollection").add(new SnippetDropdownModel(featureAttribute));
            }
            else if (featureAttribute.type === "integer") {
                featureAttribute = _.extend(featureAttribute, {"snippetType": "slider"});
                this.get("snippetCollection").add(new SnippetSliderModel(featureAttribute));
            }
        },

        /**
         * adds a snippet for the map extent search
         * @return {[type]} [description]
         */
        addSearchInMapExtentSnippet: function () {
            this.get("snippetCollection").add(new SnippetCheckboxModel({
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
            featureAttributesMap = this.trimAttributes(featureAttributes);
            featureAttributesMap = this.mapDisplayNames(featureAttributesMap);

            featureAttributesMap = this.collectAttributeValues(featureAttributesMap);
            this.setFeatureAttributesMap(featureAttributesMap);
            this.addSnippets(featureAttributesMap);
            if (this.get("isSelected") === true) {
                this.runFilter();
                this.trigger("renderSnippets");
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

             _.each(this.get("attributeWhiteList"), function (attr) {
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
            var displayNames = Radio.request("RawLayerList", "getDisplayNamesOfFeatureAttributes", this.get("layerId"));

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
         * iterates over the snippet collection and
         * calls in the snippet deselectValueModels
         */
        deselectAllValueModels: function () {
            _.each(this.get("snippetCollection").models, function (snippet) {
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
            if (!this.get("isSelected")) {
                // die Query-Collection hört im Filter-Model auf diesen Trigger
                this.collection.trigger("deselectAllModels", this);
                this.collection.trigger("deactivateAllModels", this);
                this.setIsSelected(true);
                if (this.get("isActive")) {
                    this.runFilter();
                }
            }
        },

        setIsSelected: function (value) {
            if (this.get("activateOnSelection")) {
                this.setIsActive(value);
            }
            this.set("isSelected", value);
        },
        setIsActive: function (value) {
            // if (!this.get("isActive") && value) {
            //     var featureIds = [];
            //
            //     _.each(this.get("features"), function (feature) {
            //         featureIds.push(feature.getId());
            //     }, this);
            //     this.set("featureIds", featureIds);
            // }
            this.set("isActive", value);
        },

        setFeatureIds: function (value) {
            this.set("featureIds", value);
        },
        setIsNoValueSelected: function (value) {
            this.set("isNoValueSelected", value);
        },
        setIsLayerVisible: function (value) {
            this.set("isLayerVisible", value);
        },
        setActivateOnSelection: function (value) {
            this.set("activateOnSelection", value);
        }
    });

    return QueryModel;
});
