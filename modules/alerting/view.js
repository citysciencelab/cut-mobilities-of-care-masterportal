define(function (require) {
    require("bootstrap/alert");

    var Backbone = require("backbone"),
        AlertingModel = require("modules/alerting/model"),
        AlertingTemplate = require("text!modules/alerting/template.html"),
        Radio = require("backbone.radio"),
        AlertingView;

    AlertingView = Backbone.View.extend({
        id: "messages",
        className: "top-center",
        model: new AlertingModel(),
        template: _.template(AlertingTemplate),
        initialize: function () {
            this.listenTo(this.model, {
                "render": this.render,
                "removeAll": this.removeAll,
                "change:position": this.positionAlerts
            }, this);

            $("body").prepend(this.$el);
        },
        events: {
            "click .close": "alertClosed"
        },
        render: function () {
            var attr = this.model.toJSON();

            this.$el.append(this.template(attr));
        },

        alertClosed: function (evt) {
            var div = $(evt.currentTarget).parent(),
                isDismissable = div.length > 0 ? $(div[0]).hasClass("alert-dismissable") : false;

            if (isDismissable === true) {
                Radio.trigger("Alert", "closed", $(div[0]).attr("id"));
            }

        },

        /**
         * Positioniert der Alerts über css-Klassen
         * @param  {Backbone.Model} model - this.model
         * @param  {String} value - this.model.get("position")
         */
        positionAlerts: function (model, value) {
            var currentClassName = this.$el.attr("class");

            this.$el.removeClass(currentClassName);
            this.$el.addClass(value);
        },

        /**
         * Entfernt alle Meldungen
         */
        removeAll: function () {
            this.$el.find(".alert").remove();
        }
    });

    return new AlertingView();
});
