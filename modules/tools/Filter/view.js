define(function (require) {

    var FilterModel = require("modules/tools/filter/model"),
        QueryDetailView = require("modules/tools/filter/query/detailView"),
        QuerySimpleView = require("modules/tools/filter/query/simpleView"),
        template = require("text!modules/tools/filter/template.html"),
        FilterView;

    FilterView = Backbone.View.extend({
        id: "filter-view",
        template: _.template(template),
        className: "filter",
        events: {
            "click .close": "closeFilter"
        },
        initialize: function (attr) {
            this.domTarget = attr.domTarget;
            this.model = new FilterModel();
            this.listenTo(this.model, {
                "change:isActive": function (model, isActive) {
                    if (isActive) {
                        this.render();
                    }
                    else {
                        this.$el.remove();
                    }
                }
            }),
            this.listenTo(this.model.get("queryCollection"), {
                "change:isSelected": function (model, value) {
                    if (value === true) {
                        this.renderDetailView(model);
                    }
                    this.model.closeGFI();
                }
             });
            if (this.model.get("isInitOpen")) {
                Radio.trigger("Sidebar", "toggle", true);
                this.model.set("isActive", true);
                // this.render();
            }
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
            if (_.isUndefined(selectedModel) === false) {
                var view = new QueryDetailView({model: selectedModel});

                this.$el.append(view.render());
                view.renderSnippets();
                view.renderValueViews();
            }
        },

        renderSimpleViews: function () {
            var view;

            _.each(this.model.get("queryCollection").models, function (query) {
                view = new QuerySimpleView({model: query});
                this.$el.find(".simple-views-container").append(view.render());
            }, this);
        },
        closeFilter: function () {
            this.model.setIsActive(false);
            this.$el.remove();
        }
    });

    return FilterView;
});
