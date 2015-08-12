define([
    "backbone",
    "text!modules/measure/template.html",
    "modules/measure/model",
    "eventbus"
], function (Backbone, MeasureTemplate, Measure, EventBus) {

    var MeasureView = Backbone.View.extend({
        model: Measure,
        className: "win-body",
        template: _.template(MeasureTemplate),
        events: {
            "change select": "setGeometryType",
            "click button": "deleteFeatures"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin": this.render
            });
        },

        render: function () {
            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                var attr = this.model.toJSON();

                this.$el.html("");
                $(".win-heading").after(this.$el.html(this.template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },

        setGeometryType: function (evt) {
            this.model.setGeometryType(evt.target.value);
            EventBus.trigger("activateClick", "measure");
        },

        deleteFeatures: function () {
            this.model.deleteFeatures();
        }

    });

    return MeasureView;
});
