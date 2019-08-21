import QueryDetailView from "./query/detailView";
import QuerySimpleView from "./query/simpleView";
import Template from "text-loader!./template.html";

const FilterView = Backbone.View.extend({
    events: {
        "click .close": "closeFilter"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": function (model, isActive) {
                if (isActive) {

                    if (model.get("queryCollection").length < 1) {
                        model.createQueries(model.get("predefinedQueries"));
                    }
                    this.render();
                    this.renderDetailView();
                }
                else {
                    this.model.get("detailView").$el[0].remove();
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
            "renderDetailView": this.renderDetailView,
            "add": function () {
                this.render();
                this.renderDetailView();
            }
        });

        if (this.model.get("isActive")) {
            if (this.model.get("queryCollection").length < 1) {
                this.model.createQueries(this.model.get("predefinedQueries"));
            }
            this.render();
        }
    },
    id: "filter-view",
    template: _.template(Template),
    className: "filter",

    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        if (this.model.get("uiStyle") === "TABLE") {
            Radio.trigger("TableMenu", "appendFilter", this.el);
        }
        else {
            Radio.trigger("Sidebar", "append", this.el);
            Radio.trigger("Sidebar", "toggle", true);
        }
        this.renderSimpleViews();
        this.delegateEvents();

        return this;
    },

    renderDetailView: function () {
        var selectedModel = this.model.get("queryCollection").findWhere({isSelected: true}),
            view;

        if (!_.isUndefined(selectedModel)) {
            view = new QueryDetailView({model: selectedModel});

            this.model.setDetailView(view);
            this.$el.find(".detail-view-container").html(view.render().$el);
        }
    },

    renderSimpleViews: function () {
        var view,
            queryCollectionModels = this.model.get("queryCollection").models,
            predefinedQueriesModels = this.model.get("predefinedQueries");

        if (queryCollectionModels.length > 1) {
            _.each(queryCollectionModels, function (queryCollectionModel) {
                const query = this.model.regulateInitialActivating(queryCollectionModel, predefinedQueriesModels);

                view = new QuerySimpleView({model: query});
                this.$el.find(".simple-views-container").append(view.render().$el);
            }, this);
        }
        else {
            this.model.activateLayer(queryCollectionModels);
            this.$el.find(".simple-views-container").remove();
        }
    },
    closeFilter: function () {
        this.model.setIsActive(false);
        this.model.collapseOpenSnippet();
        Radio.trigger("ModelList", "toggleDefaultTool");
    }
});

export default FilterView;
