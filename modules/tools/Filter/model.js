define(function (require) {

    var QueryModel = require("modules/tools/filter/query/source/wfs"),
        FilterModel;

    FilterModel = Backbone.Model.extend({
        defaults: {
            isGeneric: false,
            isInitOpen: false,
            isVisible: false,
            id: "filter",
            queryCollection: {}
        },
        initialize: function () {
            this.set("queryCollection", new Backbone.Collection());
            this.listenTo(this.get("queryCollection"), {
                "deselectAllModels": function () {
                    _.each(this.get("queryCollection").models, function (model) {
                        model.setIsSelected(false);
                    });
                }
            }, this);
            this.setDefaults();
            this.createQueries(this.getConfiguredQueries());
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
        }
    });

    return FilterModel;
});
