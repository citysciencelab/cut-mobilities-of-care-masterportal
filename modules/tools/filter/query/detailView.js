define(function (require) {

    var SnippetDropdownView = require("modules/Snippets/dropDown/view"),
        SnippetSliderView = require("modules/Snippets/slider/range/view"),
        QueryDetailView;

    QueryDetailView = Backbone.View.extend({
        initialize: function () {
            this.listenTo(this.model, {
                "renderSubViews": this.renderSubViews,
                "render": this.render,
                "change:isSelected": this.removeView
            }, this);
        },

        render: function () {
            return this.el;
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

        removeView: function (model, value) {
            if (value === false) {
                this.remove();
            }
        }
    });

    return QueryDetailView;
});
