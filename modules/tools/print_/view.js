define(function (require) {
    var PrintTemplate = require("text!modules/tools/print_/template.html"),
        PrintView;

    PrintView = Backbone.View.extend({
        events: {
            "click": function () {
                console.log(44);
            }
        },

        initialize: function () {
            this.template = _.template(PrintTemplate);
            this.listenTo(this.model, {
                "change:isActive": this.render
            });
        },

        render: function (model, value) {
            if (value) {
                this.setElement(document.getElementsByClassName("win-body")[0]);
                this.$el.html(this.template(model.toJSON()));
                this.delegateEvents();
            }
            else {
                this.$el.empty();
            }

            return this;
        }
    });

    return PrintView;
});
