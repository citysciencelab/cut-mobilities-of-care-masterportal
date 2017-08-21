define(function (require) {

    var QueryModel = require("modules/tools/filter/query/source/wfs"),
        QueryView = require("modules/tools/filter/query/detailView"),
        FilterModel;

    FilterModel = Backbone.Model.extend({
        defaults: {
            isGeneric: false,
            isInitOpen: false,
            isVisible: false,
            id: "filter",
            queries: new Backbone.Collection()
        },
        initialize: function () {
            this.setDefaults();
            this.createQueries(this.getConfiguredQueries());
            this.get("queries").at(0).trigger("render");
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

            this.getQueries().add(query);
            new QueryView({model: query});
        },
        getQueries: function () {
            return this.get("queries");
        },

        getConfiguredQueries: function () {
            return this.get("predefinedQueries");
        }
    });

    return FilterModel;
});
