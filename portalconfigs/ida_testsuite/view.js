define(function (require) {

    var Backbone = require("backbone"),
        View;

    View = Backbone.View.extend({
        tagName: "tr",
        events: {
            "click button": "sendRequest"
        },

        initialize: function () {
            this.listenTo(this.model, {
                "requestReady": function () {
                    this.addBackground();
                    this.render();
                },
                "requestStart": this.removeBackground
            });
        },

        render: function () {
            var attr = _.omit(this.model.toJSON(), ["payload", "adresse"]);

            this.$el.empty();
            _.each(attr, function (value, key) {
                if (key === "actualValue" || key === "soll") {
                    this.$el.append("<td><mark>" + value + "</mark></td>");
                }
                else {
                    this.$el.append("<td>" + value + "</td>");
                }
            }, this);
            if (this.model.has("actualValue") === false) {
                this.$el.append("<td>-</td>");
            }
            this.$el.append("<td><button type='button' class='btn btn-info btn-xs'>Senden</button></td>");

            return this;
        },

        /**
         * css Klasse für den Hintergrund wird gesetzt, abhängig vom Ist-/Sollwert Vergleich
         */
        addBackground: function () {
            if (this.model.getGivenValue() === this.model.getActualValue()) {
                this.$el.addClass("success");
            }
            else {
                this.$el.addClass("danger");
            }
        },

        /**
         * Eventuell gesetzte css Klasse für den Hintergrund wird entfernt
         */
        removeBackground: function () {
            this.$el.removeClass("success");
            this.$el.removeClass("danger");
        },

        /**
         * Weiterleitung an die Methode sendRequest im Model
         */
        sendRequest: function () {
            this.model.sendRequest();
        }
    });

    return View;
});
