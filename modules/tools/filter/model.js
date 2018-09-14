define(function (require) {

    var WfsQueryModel = require("modules/tools/filter/query/source/wfs"),
        Tool = require("modules/core/modelList/tool/model"),
        FilterModel;

    FilterModel = Tool.extend({
        defaults: _.extend({}, Tool.prototype.defaults, {
            isGeneric: false,
            isInitOpen: false,
            isVisible: false,
            isVisibleInMenu: true,
            id: "filter",
            queryCollection: {},
            isActive: false,
            allowMultipleQueriesPerLayer: false,
            liveZoomToFeatures: true,
            sendToRemote: false,
            renderToSidebar: true,
            renderToWindow: false
        }),
        initialize: function () {
            var channel = Radio.channel("Filter");

            this.superInitialize();
            this.listenTo(channel, {
                "resetFilter": this.resetFilter
            });

            this.set("queryCollection", new Backbone.Collection());
            this.listenTo(this.get("queryCollection"), {
                "deactivateAllModels": function (model) {
                    this.deactivateOtherModels(model);
                },
                "deselectAllModels": this.deselectAllModels,
                "featureIdsChanged": function (featureIds, layerId) {
                    this.updateMap();
                    this.updateGFI(featureIds, layerId);
                    this.updateFilterObject();
                },
                "closeFilter": function () {
                    this.setIsActive(false);
                }
            }, this);
        },

        resetFilter: function (feature) {
            if (feature && feature.getStyleFunction()() === null) {
                this.deselectAllModels();
                this.deactivateAllModels();
                this.resetAllQueries();
                this.activateDefaultQuery();
            }
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
        deselectAllModels: function () {
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
            var allFeatureIds;

            if (_.contains(this.get("queryCollection").pluck("isSelected"), true)) {
                allFeatureIds = this.groupFeatureIdsByLayer(this.get("queryCollection"));

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

        updateGFI: function (featureIds, layerId) {
            var getVisibleTheme = Radio.request("GFI", "getVisibleTheme"),
                featureId;

            if (getVisibleTheme && getVisibleTheme.get("id") === layerId) {
                featureId = getVisibleTheme.get("feature").getId();

                if (!_.contains(featureIds, featureId)) {
                    Radio.trigger("GFI", "setIsVisible", false);
                }
            }
        },

        /**
         * builds an array of object that reflects the current filter
         * @return {void}
         */
        updateFilterObject: function () {
            var filterObjects = [];

            this.get("queryCollection").forEach(function (query) {
                var ruleList = [];

                query.get("snippetCollection").forEach(function (snippet) {
                    // searchInMapExtent is ignored
                    if (snippet.getSelectedValues().values.length > 0 && snippet.get("type") !== "searchInMapExtent") {
                        ruleList.push(_.omit(snippet.getSelectedValues(), "type"));
                    }
                });
                filterObjects.push({name: query.get("name"), isSelected: query.get("isSelected"), rules: ruleList});
            });
            Radio.trigger("ParametricURL", "updateQueryStringParam", "filter", JSON.stringify(filterObjects));
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
                    var isEveryQueryActive = _.every(group, function (model) {
                        return !model.get("isActive");
                    });

                    featureIds = this.collectFilteredIds(group);

                    if (isEveryQueryActive) {
                        Radio.trigger("ModelList", "showAllFeatures", layerId);
                    }
                    else {
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
            });
            return _.unique(featureIdList);
        },

        createQueries: function (queries) {
            var queryObjects = Radio.request("ParametricURL", "getFilter");

            _.each(queries, function (query) {
                var queryObject,
                    oneQuery = query;

                if (!_.isUndefined(queryObjects)) {
                    queryObject = _.findWhere(queryObjects, {name: oneQuery.name});

                    oneQuery = _.extend(oneQuery, queryObject);
                }
                this.createQuery(oneQuery);
            }, this);
        },

        createQuery: function (model) {
            var layer = Radio.request("ModelList", "getModelByAttributes", {id: model.layerId}),
                query;

            if (!_.isUndefined(layer)) {
                query = layer.get("typ") === "WFS" || layer.get("typ") === "GeoJSON" ? new WfsQueryModel(model) : undefined;

                if (!_.isUndefined(this.get("allowMultipleQueriesPerLayer"))) {
                    _.extend(query.set("activateOnSelection", !this.get("allowMultipleQueriesPerLayer")));
                }

                if (!_.isUndefined(this.get("liveZoomToFeatures"))) {
                    query.set("liveZoomToFeatures", this.get("liveZoomToFeatures"));
                }

                if (!_.isUndefined(this.get("sendToRemote"))) {
                    query.set("sendToRemote", this.get("sendToRemote"));
                }
                if (!_.isUndefined(this.get("minScale"))) {
                    query.set("minScale", this.get("minScale"));
                }

                if (query.get("isSelected")) {
                    query.setIsDefault(true);
                    query.setIsActive(true);
                }
                this.get("queryCollection").add(query);
            }
        },

        setIsActive: function (value) {
            this.set("isActive", value);
        },
        closeGFI: function () {
            Radio.trigger("GFI", "setIsVisible", false);
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
        },

        // setter for isInitOpen
        setIsInitOpen: function (value) {
            this.set("isInitOpen", value);
        }
    });

    return FilterModel;
});
