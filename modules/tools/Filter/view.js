define(function (require) {

    var FilterModel = require("modules/tools/filter/model"),
        QueryDetailView = require("modules/tools/filter/query/detailView"),
        QuerySimpleView = require("modules/tools/filter/query/simpleView"),
        template = require("text!modules/tools/filter/template.html"),
        FilterView;

    FilterView = Backbone.View.extend({
        id: "filter-view",
        template: _.template(template),
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
            var attr = this.model.toJSON();

            $(".sidebar").append(this.$el.html(this.template(attr)));
        },

        renderDetailView: function (selectedModel) {
            var view;

            view = new QueryDetailView({model: selectedModel});
            this.$el.find(".detail-view").append(view.render());
            view.renderSubViews();
        },

        renderSimpleViews: function () {
            var view;

            _.each(this.model.get("queryCollection").models, function (query) {
                view = new QuerySimpleView({model: query});

                this.$el.find(".simple-views").append(view.render());
            }, this);
        }
    });

    return FilterView;
});
