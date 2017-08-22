define(function (require) {

    var FilterModel = require("modules/tools/filter/model"),
        QueryDetailView = require("modules/tools/filter/query/detailView"),
        QuerySimpleView = require("modules/tools/filter/query/simpleView"),
        FilterView;

    FilterView = Backbone.View.extend({
        initialize: function () {
            this.model = new FilterModel();
            this.listenTo(this.model.get("queries"), {
                "change:isSelected": function (model, value) {//console.log(value);
                    if (value === true) {
                        this.renderDetailView(model);
                    }
                }
            }, this);
            this.render();

            this.renderSimpleViews();
            this.renderDetailView(this.model.get("queries").findWhere({isSelected: true}));
        },
        render: function () {
            $(".sidebar").append(this.$el);
        },

        renderDetailView: function (selectedModel) {
            var view;
            // var selectedModel = this.model.get("queries").findWhere({isSelected: true});
// console.log(this.$el);
            // console.log(selectedModel);
            // _.each(this.model.get("queries").models, function (query) {
                view = new QueryDetailView({model: selectedModel});
                // if (query.get("isSelected") === true) {
                    this.$el.append(view.render());
                    view.renderSubViews();
                // }
            // }, this);
        },

        renderSimpleViews: function () {
            var view;

            _.each(this.model.get("queries").models, function (query) {
                // debugger;
                view = new QuerySimpleView({model: query});
                this.$el.append(view.render());
            }, this);
        }
    });

    return FilterView;
});
