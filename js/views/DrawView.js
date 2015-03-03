define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Draw.html',
    'models/Draw',
    'eventbus'
], function ($, _, Backbone, DrawTemplate, Draw, EventBus) {

    var DrawView = Backbone.View.extend({
        model: Draw,
        className: 'win-body',
        template: _.template(DrawTemplate),
        events: {
            "change select": "setGeometryType",
            "click button": "deleteFeatures"
        },
        initialize: function () {
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this);
        },

        "setGeometryType": function (evt) {
            this.model.setGeometryType(evt.target.value);
            // EventBus.trigger('activateClick', 'draw');
        },

        "deleteFeatures": function () {
            this.model.deleteFeatures();
        },

        "render": function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();
                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        }
    });

    return DrawView;
});
