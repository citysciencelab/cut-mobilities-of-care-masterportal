define([
    "backbone",
    "text!modules/tools/template.html",
    "modules/tools/model"
    ], function (Backbone, ToolsTemplate, Tools) {
    var ToolsView = Backbone.View.extend({
        tagName: "li",
        template: _.template(ToolsTemplate),
        events: {
            "click": "setActiveToTrue"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isActive": this.toggleStyle
            });

            if (this.model.get("isActive") === true) {
                this.toggleStyle();
            }
            this.render();
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.html(this.template(attr));
            return this;
        },
        toggleStyle: function () {
            this.$el.toggleClass("active");
        },
        setActiveToTrue: function () {
            this.model.setActiveToTrue();
        }
    });

    return ToolsView;
});
