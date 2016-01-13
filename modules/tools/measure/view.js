define([
    "backbone",
    "text!modules/tools/measure/template.html",
    "modules/tools/measure/model",
    "eventbus"
], function (Backbone, MeasureTemplate, Measure, EventBus) {

    var MeasureView = Backbone.View.extend({
        model: Measure,
        className: "win-body",
        template: _.template(MeasureTemplate),
        events: {
            "change select#geomField": "setGeometryType",
            "change select#unitField": "setUnit",
            "change select#decimalField": "setDecimal",
            "click button": "deleteFeatures"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:type": this.render
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

        setUnit: function (evt) {
            this.model.setUnit(evt.target.value);
        },

        setDecimal: function (evt) {
            this.model.setDecimal(evt.target.value);
        },

        deleteFeatures: function () {
            this.model.deleteFeatures();
        }

    });

    return MeasureView;
});
