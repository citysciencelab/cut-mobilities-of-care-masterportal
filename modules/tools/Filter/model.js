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
                "featureIdsChanged": this.sendFeatureIds
            }, this);
            this.setDefaults();
            this.createQueries(this.getConfiguredQueries());
        },
        sendFeatureIds: function () {
            var allFeatureIds = [];
            // if at least one query is selected zoomToFilteredFeatures, otherwise showAllFeatures
            if (_.contains(this.get("queryCollection").pluck("isSelected"), true)) {
                _.each(this.get("queryCollection").groupBy("layerId"), function (group, layerId) {
                    var featureIdList = [],
                        uniqueFeatureIds;

                    _.each(group, function (query) {
                        if (query.get("isSelected") === true) {
                            _.each(query.get("featureIds"), function (featureId) {
                                featureIdList.push(featureId);
                            });
                        }
                    });
                    uniqueFeatureIds = _.unique(featureIdList);
                    Radio.trigger("ModelList", "showFeaturesById", layerId, uniqueFeatureIds);
                    allFeatureIds.push({
                        layer: layerId,
                        ids: uniqueFeatureIds
                    });
                });
                Radio.trigger("Map", "zoomToFilteredFeatures", allFeatureIds);
            }
            else {
                _.each(this.get("queryCollection").groupBy("layerId"), function (group, layerId) {
                    Radio.trigger("ModelList", "showAllFeatures", layerId);
                });
            }
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
