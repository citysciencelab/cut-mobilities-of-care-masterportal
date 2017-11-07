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
            isActive: false,
            allowMultipleQueriesPerLayer: true
        },
        initialize: function () {
            var channel = Radio.channel("Filter");

            this.listenTo(channel, {
                "resetFilter": this.resetFilter
            });
            this.listenTo(Radio.channel("Tool"), {
                "activatedTool": this.activate
            });
            this.set("queryCollection", new Backbone.Collection());
            this.listenTo(this.get("queryCollection"), {
                "deactivateAllModels": function (model) {
                    this.deactivateOtherModels(model);
                },
                "deselectAllModels": this.deselectAllModels,
                "featureIdsChanged": function (featureIds) {
                    this.updateMap();
                    this.updateGFI(featureIds);
                },
                "closeFilter": function () {
                    this.setIsActive(false);
                }
            }, this);
            this.setDefaults();

            this.createQueries(this.getConfiguredQueries());
        },
        resetFilter: function () {
            this.deselectAllModels();
            this.deactivateAllModels();
            this.resetAllQueries();
            this.activateDefaultQuery();
        },
        activateDefaultQuery: function () {
            var defaultQuery = this.get("queryCollection").findWhere({isDefault: true});

            if (!_.isUndefined(defaultQuery)) {
                defaultQuery.setIsActive(true);
                defaultQuery.setIsSelected(true);
            }
            defaultQuery.runFilter();
        },
        resetAllQueries: function () {
            _.each(this.get("queryCollection").models, function (model) {
                model.deselectAllValueModels();
            }, this);
        },
        deselectAllModels: function (selectedModel) {
            _.each(this.get("queryCollection").models, function (model) {
                model.setIsSelected(false);
            }, this);
        },
        deactivateAllModels: function () {
            _.each(this.get("queryCollection").models, function (model) {
                    model.setIsActive(false);
            }, this);
        },

        deactivateOtherModels: function (selectedModel) {
            if (!this.get("allowMultipleQueriesPerLayer")) {
                _.each(this.get("queryCollection").models, function (model) {
                    if (!_.isUndefined(model) &&
                        selectedModel.cid !== model.cid &&
                        selectedModel.get("layerId") === model.get("layerId")) {
                        model.setIsActive(false);
                    }
                }, this);
            }
        },
        /**
         * updates the Features shown on the Map
         * @return {[type]} [description]
         */
        updateMap: function () {
            // if at least one query is selected zoomToFilteredFeatures, otherwise showAllFeatures
            if (_.contains(this.get("queryCollection").pluck("isSelected"), true)) {
                var allFeatureIds = this.groupFeatureIdsByLayer(this.get("queryCollection"));

                _.each(allFeatureIds, function (layerFeatures) {
                    Radio.trigger("ModelList", "showFeaturesById", layerFeatures.layer, layerFeatures.ids);
                });
            }
            else {
                _.each(this.get("queryCollection").groupBy("layerId"), function (group, layerId) {
                    Radio.trigger("ModelList", "showAllFeatures", layerId);
                });
            }
        },

        updateGFI: function (featureIds) {
            var getVisibleTheme = Radio.request("GFI", "getVisibleTheme");

            if (getVisibleTheme) {
                var featureId = getVisibleTheme.get("feature").getId();

                if (!_.contains(featureIds, featureId)) {
                    Radio.trigger("GFI", "hideGFI");
                }
            }
        },

        /**
         * collects the ids from of all features that match the filter, maps them to the layerids
         * @param  {[object]} queries query objects
         * @return {object} Map object mapping layers to featuresids
         */
        groupFeatureIdsByLayer: function (queries) {
            var allFeatureIds = [],
                featureIds;

            if (!_.isUndefined(queries)) {
                _.each(queries.groupBy("layerId"), function (group, layerId) {
                    featureIds = this.collectFilteredIds(group);
                    if (featureIds.length > 0) {
                        allFeatureIds.push({
                            layer: layerId,
                            ids: featureIds
                        });
                    }
                }, this);
            }
            return allFeatureIds;
        },

        /**
         * collects all featureIds of a group of queries into a list of uniqueIds
         * @param  {[object]} queryGroup group of queries
         * @return {[string]} unique list of all feature ids
         */
        collectFilteredIds: function (queryGroup) {
            var featureIdList = [];

            _.each(queryGroup, function (query) {
                if (query.get("isActive") === true) {
                    _.each(query.get("featureIds"), function (featureId) {
                        featureIdList.push(featureId);
                    });
                }
                else {
                    Radio.trigger("ModelList", "showAllFeatures", query.get("layerId"));
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

            if (!_.isUndefined(this.get("allowMultipleQueriesPerLayer"))) {
                _.extend(query.set("activateOnSelection", !this.get("allowMultipleQueriesPerLayer")));
            }

            if (query.get("isSelected")) {
                query.setIsDefault(true);
                query.setIsActive(true);
            }

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
            Radio.trigger("MapMarker", "hideMarker");
        },
        collapseOpenSnippet: function () {
            var selectedQuery = this.get("queryCollection").findWhere({isSelected: true}),
                snippetCollection,
                openSnippet;

            if (!_.isUndefined(selectedQuery)) {
                snippetCollection = selectedQuery.get("snippetCollection");

                openSnippet = snippetCollection.findWhere({isOpen: true});
                if (!_.isUndefined(openSnippet)) {
                    openSnippet.setIsOpen(false);
                }
            }
        }
    });

    return FilterModel;
});
