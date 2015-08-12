define([
    'jquery',
    'underscore',
    'backbone',
    'text!templates/Measure.html',
    'models/Measure',
    'eventbus'
], function ($, _, Backbone, MeasureTemplate, Measure, EventBus) {

    var MeasureView = Backbone.View.extend({
        model: Measure,
        className: 'win-body',
        template: _.template(MeasureTemplate),
        events: {
            "change select": "setGeometryType",
            "click button": "deleteFeatures"
        },
        initialize: function () {
            this.model.on("change:isCollapsed change:isCurrentWin", this.render, this);
        },

        "setGeometryType": function (evt) {
            this.model.setGeometryType(evt.target.value);
            EventBus.trigger('activateClick', 'measure');
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

    return MeasureView;
});
