define(function (require) {

    var SnippetDropdownView = require("modules/Snippets/dropDown/view"),
        QueryDetailView;

    QueryDetailView = Backbone.View.extend({
        initialize: function () {
            console.log(this.model);
            this.listenTo(this.model, {
                "renderSubViews": this.renderSubViews,
                "render": this.render
            }, this);
        },
        render: function () {
            $(".test").append(this.el);
        },

        renderSubViews: function () {
            var view;

            _.each(this.model.get("snippets").models, function (snippet) {
                // debugger;
                if (snippet.get("type") === "string") {
                    view = new SnippetDropdownView({model: snippet});
                    this.$el.append(view.render());
                }
                else {
                    console.log("else");
                }
            }, this);
        }
    });

    return QueryDetailView;
});
