define(function (require) {

    var SnippetDropdownView = require("modules/Snippets/dropDown/view"),
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
                    console.log("else");
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
