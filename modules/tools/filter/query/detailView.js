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
                "renderSubViews": this.renderSubViews,
                "render": this.render,
                "change:isSelected": this.removeView
            }, this);
            this.listenTo(this.model.get("snippetCollection"), {
                "valuesChanged": this.renderValueViews
            }, this);
        },

        render: function () {
            // return this.el;
            var attr = this.model.toJSON();

            return this.$el.html(this.template(attr));
        },

        renderSubViews: function () {
            var view;

            _.each(this.model.get("snippetCollection").models, function (snippet) {
                if (snippet.get("type") === "string") {
                    view = new SnippetDropdownView({model: snippet});
                    this.$el.append(view.render());
                }
                else {
                    view = new SnippetSliderView({model: snippet});
                    this.$el.append(view.render());
                }
            }, this);
        },
        renderValueViews: function () {
             var view;

            // this.$el.find(".value-views-container").html("");

            _.each(this.model.get("snippetCollection").models, function (snippet) {
                _.each(snippet.get("valuesCollection").models, function (value) {
                    view = new QueryValuesView({model: value});
                    this.$el.find(".value-views-container").append(view.render());
                }, this);
            }, this);
        },

        removeView: function (model, value) {
            if (value === false) {
                this.remove();
            }
        }
    });

    return QueryDetailView;
});
