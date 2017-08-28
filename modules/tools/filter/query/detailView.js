define(function (require) {

    var SnippetDropdownView = require("modules/Snippets/dropDown/view"),
        QueryValuesView = require("modules/tools/filter/query/valuesView"),
        Template = require("text!modules/tools/filter/query/templateDetailView.html"),
        SnippetSliderView = require("modules/Snippets/slider/range/view"),
        QueryDetailView;

    QueryDetailView = Backbone.View.extend({
        template: _.template(Template),
        initialize: function () {
            this.listenTo(this.model, {
                "renderSnippets": this.renderSnippets,
                "render": this.render,
                "change:isSelected": this.removeView
            }, this);
            this.listenTo(this.model.get("snippetCollection"), {
                "valuesChanged": this.renderValueViews
            }, this);
        },

        render: function () {
            var attr = this.model.toJSON();

            return this.$el.html(this.template(attr));
        },

        renderSnippets: function () {
            var view;

            _.each(this.model.get("snippetCollection").models, function (snippet) {
                if (snippet.get("type") === "string") {
                    view = new SnippetDropdownView({model: snippet});
                    this.$el.append(view.render());
                }
                else if (snippet.get("type") === "boolean") {
                    view = new SnippetDropdownView({model: snippet});
                    this.$el.append(view.render());
                }
                else {
                    view = new SnippetSliderView({model: snippet});
                    this.$el.append(view.render());
                }
            }, this);
        },
        /**
         * Rendert die View in der die ausgewählten Werte stehen, nach denen derzeit gefiltert wird.
         * Die Werte werden in den Snippets gespeichert.
         */
        renderValueViews: function () {
            _.each(this.model.get("snippetCollection").models, function (snippet) {
                _.each(snippet.get("valuesCollection").models, function (valueModel) {
                    valueModel.trigger("removeView");
                    if (valueModel.get("isSelected")) {
                        var view = new QueryValuesView({model: valueModel});

                        this.$el.find(".value-views-container").append(view.render());
                    }
                }, this);
            }, this);

            this.model.runFilter();
        },

        removeView: function (model, value) {
            if (value === false) {
                this.remove();
            }
        }
    });

    return QueryDetailView;
});
