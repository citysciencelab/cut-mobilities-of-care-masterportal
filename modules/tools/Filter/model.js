define(function (require) {

    var QueryModel = require("modules/tools/filter/query/source/wfs"),
        QueryDetailView = require("modules/tools/filter/query/detailView"),
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
            this.listenTo(this.get("queries"), {
                "deselectAllModels": function () {
                    // debugger;
                    _.each(this.get("queries").models, function (model) {
                        // if (model.get("isSelected") === true && model.cid !== newModel.cid) {
                        //     console.log("443");
                            model.setIsSelected(false);
                        // }
                    });
                    // console.log(this);
                    // this.trigger("renderDetailView", newModel);
                }
            }, this);
            this.setDefaults();
            this.createQueries(this.getConfiguredQueries());
            // console.log(this.get("queries").at(0).get("snippets"));
            console.log(this.get("queries"));
            // this.get("queries").at(0).trigger("render");
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
            // if (query.get("isSelected") === true) {
            //     new QueryDetailView({model: query});
            // }
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
