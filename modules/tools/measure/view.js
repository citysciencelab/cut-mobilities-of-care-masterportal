define([
    "backbone",
    "text!modules/tools/measure/template.html",
    "modules/tools/measure/model",
    "eventbus"
], function (Backbone, MeasureTemplate, Measure, EventBus) {

    var MeasureView = Backbone.View.extend({
        model: new Measure(),
        className: "win-body",
        template: _.template(MeasureTemplate),
        events: {
            "change select#geomField": "setGeometryType",
            "change select#unitField": "setUnit",
            "click button": "deleteFeatures",
            "click .form-horizontal > .form-group-sm > .col-sm-12 > .glyphicon-question-sign": function () {
                    EventBus.trigger("showWindowHelp", "measure");
            }
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

        deleteFeatures: function () {
            this.model.deleteFeatures();
        }
    });

    return MeasureView;
});
