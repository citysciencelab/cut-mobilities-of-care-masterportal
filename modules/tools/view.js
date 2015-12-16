define([
    "backbone",
    "text!modules/tools/template.html",
    "modules/tools/model",
    "eventbus"
    ], function (Backbone, ToolsTemplate, Tools, EventBus) {

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
                EventBus.trigger("activateClick", this.model.get("name"));
            }
            this.render();
            EventBus.trigger("registerToolsClickInClickCounter", this.$el);
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
