define(function (require) {

    var FilterModel = require("modules/tools/filter/model"),
        QueryDetailView = require("modules/tools/filter/query/detailView"),
        QuerySimpleView = require("modules/tools/filter/query/simpleView"),
        FilterView;

    FilterView = Backbone.View.extend({
        initialize: function () {
            this.model = new FilterModel();
            this.listenTo(this.model.get("queryCollection"), {
                "change:isSelected": function (model, value) {
                    if (value === true) {
                        this.renderDetailView(model);
                    }
                }
            }, this);
            this.render();

            this.renderSimpleViews();
            this.renderDetailView(this.model.get("queryCollection").findWhere({isSelected: true}));
        },
        render: function () {
            $(".sidebar").append(this.$el);
        },

        renderDetailView: function (selectedModel) {
            var view;

            view = new QueryDetailView({model: selectedModel});
            this.$el.append(view.render());
            view.renderSubViews();
        },

        renderSimpleViews: function () {
            var view;

            _.each(this.model.get("queryCollection").models, function (query) {
                view = new QuerySimpleView({model: query});
                this.$el.append(view.render());
            }, this);
        }
    });

    return FilterView;
});
