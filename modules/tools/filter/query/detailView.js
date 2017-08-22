define(function (require) {

    var SnippetDropdownView = require("modules/Snippets/dropDown/view"),
        QueryDetailView;

    QueryDetailView = Backbone.View.extend({
        initialize: function () {
            // console.log(this.model);
            this.listenTo(this.model, {
                "renderSubViews": this.renderSubViews,
                "render": this.render,
                "change:isSelected": function (model, value) {
                    if (value === false) {console.log(value);
                        this.remove();
                    }
                }
            }, this);
        },
        render: function () {
            // $(".test").append(this.el);
            // this.$el.html(this.template(attr));
            return this.el;
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
