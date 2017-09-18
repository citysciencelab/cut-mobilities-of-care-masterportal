define(function (require) {

    var QueryModel = require("modules/tools/filter/query/source/wfs"),
        Radio = require("backbone.radio"),
        FilterModel;

    FilterModel = Backbone.Model.extend({
        defaults: {
            isGeneric: false,
            isInitOpen: false,
            isVisible: false,
            id: "filter",
            queryCollection: {},
            isActive: false
        },
        initialize: function () {
            this.listenTo(Radio.channel("Tool"), {
                "activatedTool": this.activate
            }),
            this.set("queryCollection", new Backbone.Collection());
            this.listenTo(this.get("queryCollection"), {
                "deselectAllModels": function () {
                    _.each(this.get("queryCollection").models, function (model) {
                        model.setIsActive(false);
                        model.setIsSelected(false);
                    });
                },
                "featureIdsChanged": this.updateMap,
                "closeFilter": function () {
                    this.setIsActive(false);
                }
            }, this);
            this.setDefaults();
            this.createQueries(this.getConfiguredQueries());
        },
        /**
         * updates the Features shown on thge Map
         * @return {[type]} [description]
         */
        updateMap: function () {
            // if at least one query is selected zoomToFilteredFeatures, otherwise showAllFeatures
            if (_.contains(this.get("queryCollection").pluck("isSelected"), true)) {
                var allFeatureIds = this.collectFeaturesIdsOfAllLayers(this.get("queryCollection"));

                _.each(allFeatureIds, function (layerFeatures) {
                    Radio.trigger("ModelList", "showFeaturesById", layerFeatures.layer, layerFeatures.ids);
                });
                Radio.trigger("Map", "zoomToFilteredFeatures", allFeatureIds);
            }
            else {
                _.each(this.get("queryCollection").groupBy("layerId"), function (group, layerId) {
                    Radio.trigger("ModelList", "showAllFeatures", layerId);
                });
            }
        },
        /**
         * collects the ids from of all features that match the filter, maps them to the layerids
         * @param  {[object]} queries query objects
         * @return {object} Map object mapping layers to featuresids
         */
        collectFeaturesIdsOfAllLayers: function (queries) {
            var allFeatureIds = [];

            _.each(queries.groupBy("layerId"), function (group, layerId) {
                featureIds = this.collectFilteredIds(group);
                allFeatureIds.push({
                    layer: layerId,
                    ids: featureIds
                });
            }, this);
            return allFeatureIds;
        },

        /**
         * collects all featureIds of a group of queries into a list of uniqueIds
         * @param  {[object]} queryGroup group of queries
         * @return {[string]} unique list of all feature ids
         */
        collectFilteredIds: function (queryGroup) {
            var featureIdList = [],
                uniqueFeatureIds;

             _.each(queryGroup, function (query) {
                if (query.get("isSelected") === true) {
                    _.each(query.get("featureIds"), function (featureId) {
                        featureIdList.push(featureId);
                    });
                }
            });
            return _.unique(featureIdList);
        },
        activate: function (id) {
            if (this.get("id") === id) {
                this.setIsActive(true);
            }
        },
        setDefaults: function () {
            var config = Radio.request("Parser", "getItemByAttributes", {id: "filter"});

            _.each(config, function (value, key) {
                this.set(key, value);
            }, this);
        },

        createQueries: function (queries) {
            _.each(queries, function (query) {
                this.createQuery(query);
            }, this);
        },

        createQuery: function (model) {
            var query = new QueryModel(model);

            this.get("queryCollection").add(query);
        },

        getConfiguredQueries: function () {
            return this.get("predefinedQueries");
        },

        setIsActive: function (value) {
            this.set("isActive", value);
            if (!value) {
                var model = Radio.request("ModelList", "getModelByAttributes", {id: this.get("id")});

                model.setIsActive(false);
                Radio.trigger("Sidebar", "toggle", false);
            }
        },
        closeGFI: function () {
            Radio.trigger("GFI", "hideGFI");
        }
    });

    return FilterModel;
});
