define([
    "backbone",
    "eventbus",
    "config",
    "modules/contact/model",
    "text!modules/contact/template.html"
], function (Backbone, EventBus, Config, Model, Template) {
    "use strict";
    var formularView = Backbone.View.extend({
        className: "win-body",
        model: Model,
        template: _.template(Template),
        initialize: function () {
            EventBus.trigger("appendItemToMenubar", {
                title: "Kontakt",
                symbol: "glyphicon glyphicon-envelope",
                classname: "contact",
                clickFunction: function () {
                    EventBus.trigger("toggleWin", ["contact", "Kontakt", "glyphicon glyphicon-envelope"]);
                }
            });
            this.model.on("change:isCollapsed render invalid change:isCurrentWin", this.render, this);
        },
        events: {
        },
        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
        }
    });

    return formularView;
});
