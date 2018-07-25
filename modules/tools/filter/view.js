define(function (require) {

    var FilterModel = require("modules/tools/filter/model"),
        QueryDetailView = require("modules/tools/filter/query/detailView"),
        QuerySimpleView = require("modules/tools/filter/query/simpleView"),
        Template = require("text!modules/tools/filter/template.html"),
        FilterView;

    FilterView = Backbone.View.extend({
        events: {
            "click .close": "closeFilter"
        },
        initialize: function (attr) {
            this.model = new FilterModel(attr);
            if (this.model.get("isInitOpen")) {
                this.model.set("isActive", true);
                this.render();
            }
            this.listenTo(this.model, {
                "change:isActive": function (model, isActive) {
                    if (isActive) {
                        this.render();
                        this.renderDetailView();
                    }
                    else {
                        this.$el.remove();
                        Radio.trigger("Sidebar", "toggle", false);
                    }
                }
            });
            this.listenTo(this.model.get("queryCollection"), {
                "change:isSelected": function (model, value) {
                    if (value === true) {
                        this.renderDetailView();
                    }
                    this.model.closeGFI();
                },
                "renderDetailView": this.renderDetailView
            });
        },
        id: "filter-view",
        template: _.template(Template),
        className: "filter",
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true);
            this.renderSimpleViews();
            this.delegateEvents();
            return this;
        },

        renderDetailView: function () {
            var selectedModel = this.model.get("queryCollection").findWhere({isSelected: true}),
                view;

            if (_.isUndefined(selectedModel) === false) {
                view = new QueryDetailView({model: selectedModel});

                this.$el.find(".detail-view-container").html(view.render().$el);
            }
        },

        renderSimpleViews: function () {
            var view;

            if (this.model.get("queryCollection").models.length > 1) {
                _.each(this.model.get("queryCollection").models, function (query) {
                    view = new QuerySimpleView({model: query});
                    this.$el.find(".simple-views-container").append(view.render().$el);
                }, this);
            }
            else {
                this.$el.find(".simple-views-container").remove();
            }
        },
        closeFilter: function () {
            this.model.setIsActive(false);
            this.model.collapseOpenSnippet();
            Radio.trigger("Sidebar", "toggle", false);
        }
    });

    return FilterView;
});
