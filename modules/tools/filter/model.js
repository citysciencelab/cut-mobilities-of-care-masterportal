import WfsQueryModel from "./query/source/wfs";
import GeoJsonQueryModel from "./query/source/geojson";
import Tool from "../../core/modelList/tool/model";

const FilterModel = Tool.extend({
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
        renderToWindow: false,
        glyphicon: "glyphicon-filter",
        uiStyle: "DEFAULT"
    }),
    initialize: function () {
        var channel = Radio.channel("Filter");

        this.superInitialize();
        this.listenTo(channel, {
            "resetFilter": this.resetFilter
        });

        channel.reply({
            "getIsInitialLoad": function () {
                return this.get("isInitialLoad");
            },
            "getFilterName": function (layerId) {
                var predefinedQuery = this.get("predefinedQueries").filter(function (query) {
                    return query.layerId === layerId;
                });

                return predefinedQuery[0].name;
            }
        }, this);

        this.set("uiStyle", Radio.request("Util", "getUiStyle"));
        this.set("queryCollection", new Backbone.Collection());
        this.listenTo(this.get("queryCollection"), {
            "deactivateAllModels": function (model) {
                this.deactivateOtherModels(model);
            },
            "deselectAllModels": this.deselectAllModels,
            "featureIdsChanged": function (featureIds, layerId) {
                this.updateMap();
                if (!this.get("queryCollection").models[0].get("isAutoRefreshing")) {
                    this.updateGFI(featureIds, layerId);
                }
                this.updateFilterObject();
            },
            "closeFilter": function () {
                this.setIsActive(false);
            }
        }, this);

        this.listenTo(Radio.channel("Layer"), {
            "featuresLoaded": function (layerId) {
                var predefinedQueries = this.get("predefinedQueries"),
                    queryCollection = this.get("queryCollection"),
                    filterModels;

                if (!this.isModelInQueryCollection(layerId, queryCollection) && this.get("isActive")) {
                    filterModels = predefinedQueries.filter(function (query) {
                        return query.layerId === layerId;
                    });

                    _.each(filterModels, function (filterModel) {
                        this.createQuery(filterModel);
                    }, this);
                }

            }
        }, this);
    },

    resetFilter: function (feature) {
        if (feature && feature.getStyleFunction() === null) {
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
     * @return {void}
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
     * @param  {Object[]} queries query objects
     * @return {Object} Map object mapping layers to featuresids
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
     * @param  {Object[]} queryGroup group of queries
     * @return {String[]} unique list of all feature ids
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
        var queryObjects = Radio.request("ParametricURL", "getFilter"),
            queryObject,
            oneQuery;

        _.each(queries, function (query) {
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

        if (!_.isUndefined(layer) && layer.has("layer")) {
            query = this.getQueryByTyp(layer.get("typ"), model);
            if (!_.isNull(query)) {
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
        }
    },

    getQueryByTyp: function (layerTyp, model) {
        var query = null;

        if (layerTyp === "WFS" || layerTyp === "GROUP") {
            query = new WfsQueryModel(model);
        }
        else if (layerTyp === "GeoJSON") {
            query = new GeoJsonQueryModel(model);
        }
        return query;
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

    isModelInQueryCollection: function (layerId, queryCollection) {
        var searchQuery = queryCollection.findWhere({layerId: layerId.toString()});

        return !_.isUndefined(searchQuery);
    },

    /**
     * Sets the parameters isActive and isSelected for each model to the configured values.
     * @param {Object} queryCollectionModel - configured model in filter
     * @param {Object[]} predefinedQueriesModels - configured values
     * @returns {Object} queryCollectionModel with default values
     */
    regulateInitialActivating: function (queryCollectionModel, predefinedQueriesModels) {
        const predefinedQueriesModel = predefinedQueriesModels.find(function (element) {
            return element.layerId === queryCollectionModel.attributes.layerId && element.name === queryCollectionModel.attributes.name;
        });

        queryCollectionModel.attributes.isActive = predefinedQueriesModel.isActive;
        queryCollectionModel.attributes.isSelected = predefinedQueriesModel.isSelected;

        return queryCollectionModel;
    },

    /**
     * Sets the attributes isActive and isVisible to true for the first model of the passed array.
     * @param {Object[]} queryCollectionModels - configured models in filter
     * @returns {void}
     */
    activateLayer: function (queryCollectionModels) {
        if (queryCollectionModels.length) {
            queryCollectionModels[0].attributes.isActive = true;
            queryCollectionModels[0].attributes.isSelected = true;
        }
    },

    // setter for isInitOpen
    setIsInitOpen: function (value) {
        this.set("isInitOpen", value);
    },

    // setter for deatailview
    setDetailView: function (value) {
        this.set("detailView", value);
    }
});

export default FilterModel;
