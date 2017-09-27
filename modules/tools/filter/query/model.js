define(function (require) {

    var SnippetDropdownModel = require("modules/Snippets/dropDown/model"),
        SnippetSliderModel = require("modules/Snippets/slider/model"),
        QueryModel;

    QueryModel = Backbone.Model.extend({

        defaults: {
            featureIds: [],
            layerIsVisibleInMap: false
        },

        /**
         * kann von erbenen Objekten augerufen werden
         */
        superInitialize: function () {
            this.set("snippetCollection", new Backbone.Collection());

            this.listenTo(this.get("snippetCollection"), {
                "valuesChanged": function (model) {
                    this.runFilter(model);
                }
            }, this);
            this.checkLayerVisibility();
            this.listenTo(Radio.channel("Layer"), {
                "layerVisibleChanged": function (layerId, visible) {
                    if (layerId === this.get("layerId")) {
                        this.setLayerIsVisibleInMap(visible);
                    }
                }
            }, this);
        },

        checkLayerVisibility: function () {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("layerId")});

            if (!_.isUndefined(model)) {
                this.setLayerIsVisibleInMap(model.getIsVisibleInMap());
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
         * Uses the WFS Features and Meta Data to build a Query consisting of one or more Snippets, where Snippets like DropDowns or Sliders
         * @param  {XML} response
         */
        createSnippets: function (response) {
            var featureAttributesMap = this.parseResponse(response);

            featureAttributesMap = this.trimAttributes(featureAttributesMap);
            featureAttributesMap = this.mapDisplayNames(featureAttributesMap);

            featureAttributesMap = this.collectAttributeValues(featureAttributesMap);
            this.setFeatureAttributesMap(featureAttributesMap);
            this.addSnippets(featureAttributesMap);
            // isLayerVisible und isSelected
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
        setIsSelected: function (value) {
            this.set("isSelected", value);
        },
        setIsActive: function (value) {
            this.set("isActive", value);
        },

        setFeatureIds: function (value) {
            this.set("featureIds", value);
        },
        setIsNoValueSelected: function (value) {
            this.set("isNoValueSelected", value);
        },
        setLayerIsVisibleInMap: function (value) {
            this.set("layerIsVisibleInMap", value);
        }
    });

    return QueryModel;
});
