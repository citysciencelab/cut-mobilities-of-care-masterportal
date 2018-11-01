import DefaultTemplate from "text-loader!./default/template.html";
import TableTemplate from "text-loader!./table/template.html";

const MeasureView = Backbone.View.extend({
    events: {
        "change select#geomField": "setGeometryType",
        "change select#unitField": "setUnit",
        "click button": "deleteFeatures",
        "click .form-horizontal > .form-group-sm > .col-sm-12 > .glyphicon-question-sign": function () {
            Radio.trigger("Quickhelp", "showWindowHelp", "measure");
        }
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive change:geomtype": this.render
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    render: function (model, value) {
        var template;

        if (value) {
            template = Radio.request("Util", "getUiStyle") === "TABLE" ? _.template(TableTemplate) : _.template(DefaultTemplate);

            this.setElement(document.getElementsByClassName("win-body")[0]);
            this.$el.html(template(model.toJSON()));
            this.delegateEvents();
        }
        else {
            this.undelegateEvents();
        }
        return this;
    },

    setGeometryType: function (evt) {
        this.model.setGeometryType(evt.target.value);
    },

    setUnit: function (evt) {
        this.model.setUnit(evt.target.value);
    },

    deleteFeatures: function () {
        this.model.deleteFeatures();
    }
});

export default MeasureView;
