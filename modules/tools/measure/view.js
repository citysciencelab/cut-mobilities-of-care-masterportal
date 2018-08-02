define(function (require) {
    var DefaultTemplate = require("text!modules/tools/measure/default/template.html"),
        TableTemplate = require("text!modules/tools/measure/table/template.html"),
        Measure = require("modules/tools/measure/model"),
        $ = require("jquery"),
        MeasureView;

    MeasureView = Backbone.View.extend({
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
                "change:isCollapsed change:isCurrentWin change:type": this.render
            });
        },
        model: new Measure(),
        className: "win-body",
        render: function () {
            var attr,
                template;

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                attr = this.model.toJSON();
                template = Radio.request("Util", "getUiStyle") === "TABLE" ? _.template(TableTemplate) : _.template(DefaultTemplate);

                this.$el.html("");
                $(".win-heading").after(this.$el.html(template(attr)));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        },

        setGeometryType: function (evt) {
            this.model.setGeometryType(evt.target.value);
            Radio.trigger("Map", "activateClick", "measure");
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
