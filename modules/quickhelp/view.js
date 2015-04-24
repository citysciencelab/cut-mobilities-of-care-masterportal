define([
    "underscore",
    "backbone",
    "text!modules/quickhelp/templateSearch.html",
    "eventbus",
    "jqueryui"
], function (_, Backbone, TemplateSearch, EventBus) {

    var view = Backbone.View.extend({
        templateSearch: _.template(TemplateSearch),
        className: "quick-help-window ui-widget-content",
        events: {
            "click .glyphicon-remove": "removeWindow"
        },
        initialize: function () {
            this.render();
            EventBus.on("showWindowHelp", this.showWindow, this);
            this.$el.draggable({
                containment: "#map"
            });
        },
        render: function () {
            $("body").append(this.$el);
        },
        removeWindow: function () {
            this.$el.hide("slow");
        },
        showWindow: function (value) {
            switch (value) {
                case "search":
                    this.$el.html(this.templateSearch());
                    break;
                default:
                    break;
            }
            this.$el.show("slow");
        }
    });

    return view;
});
