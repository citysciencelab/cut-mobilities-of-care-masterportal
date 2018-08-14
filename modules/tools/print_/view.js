define(function (require) {
    var PrintTemplate = require("text!modules/tools/print_/template.html"),
        PrintView;

    PrintView = Backbone.View.extend({
        events: {
            "change #printLayout": "setCurrentLayout",
            "change #printFormat": "setCurrentFormat",
            "change #printScale": "setCurrentScale",
            "keyup input[type='text']": "setTitle"
        },
        initialize: function () {
            this.template = _.template(PrintTemplate);
            this.listenTo(this.model, {
                "change:isActive": this.render,
                "change:currentScale": this.render,
                "change:isLegendAvailable": this.render
            });
        },

        render: function (model) {
            if (model.get("isActive")) {
                this.setElement(document.getElementsByClassName("win-body")[0]);
                this.$el.html(this.template(model.toJSON()));
                this.delegateEvents();
            }
            else {
                this.$el.empty();
            }

            return this;
        },

        setCurrentLayout: function (evt) {
            var newLayout = this.model.getLayoutByName(this.model.get("layoutList"), evt.target.value);

            this.model.setCurrentLayout(newLayout);
            this.model.setIsLegendAvailable(this.model.isLegendAvailable(newLayout));
        },

        setCurrentFormat: function (evt) {
            this.model.setCurrentFormat(evt.target.value);
        },

        setCurrentScale: function (evt) {
            this.model.setCurrentScale(parseInt(evt.target.value, 10));
        },

        setTitle: function (evt) {
            this.model.setTitle(evt.target.value);
        }
    });

    return PrintView;
});
