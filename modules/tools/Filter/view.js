define(function (require) {

    var FilterModel = require("modules/tools/filter/model"),
        QueryDetailView = require("modules/tools/filter/query/detailView"),
        QuerySimpleView = require("modules/tools/filter/query/simpleView"),
        Template = require("text!modules/tools/filter/template.html"),
        FilterView;

    FilterView = Backbone.View.extend({
        className: "filter",
        template: _.template(Template),
        events: {
            "click .close": "closeFilter"
        },
        initialize: function (attr) {
            this.domTarget = attr.domTarget;
            this.model = new FilterModel();
            this.listenTo(this.model.get("queryCollection"), {
                "change:isSelected": function (model, value) {
                    if (value === true) {
                        this.renderDetailView(model);
                    }
                }
            }, this);
             this.listenTo(this.model, {
                "change:isActive": function (model, isActive) {
                    if (isActive) {
                        this.render();
                    } else {
                        this.$el.remove();
                    }
                }
             });
        },
        render: function () {
            var attr = this.model.toJSON();

            // Target wird in der app.js übergeben
            this.domTarget.append(this.$el.html(this.template(attr)));
            this.renderSimpleViews();
            this.renderDetailView(this.model.get("queryCollection").findWhere({isSelected: true}));
            this.delegateEvents();
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
        },
        closeFilter: function () {
            this.model.setIsActive(false);
            this.$el.remove();
        }
    });

    return FilterView;
});
