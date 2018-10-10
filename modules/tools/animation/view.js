define(function (require) {

    var AnimationTemplate = require("text!modules/tools/animation/template.html"),
        AnimationView;

    AnimationView = Backbone.View.extend({
        events: {
            "click .start": "start",
            "click .reset": "reset",
            "change #select-kreis": "setKreis",
            "change #select-gemeinde": "setGemeinde",
            "change #select-trefferAnzahl": "setTrefferAnzahl",
            "change input[type=radio]": "setDirection"
        },

        initialize: function () {
            this.listenTo(this.model, {
                // ändert sich der Fensterstatus wird neu gezeichnet
                "change:isActive": this.render,
                // ändert sich eins dieser Attribute wird neu gezeichnet
                "change:gemeinden change:gemeinde change:trefferAnzahl change:direction change:animating change:pendlerLegend": this.render
            });
            // Bestätige, dass das Modul geladen wurde
            Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
        },

        tagName: "form",
        id: "animation-tool",
        template: _.template(AnimationTemplate),

        render: function (model, value) {
            if (value || !model.get("animating")) {
                this.setElement(document.getElementsByClassName("win-body")[0]);

                this.$el.html(this.template(model.toJSON()));
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        },

        start: function () {
            this.model.prepareAnimation();
        },
        reset: function () {
            this.model.stopAnimation();
        },

        setKreis: function (evt) {
            this.model.setKreis(evt.target.value);
        },

        setGemeinde: function (evt) {
            this.model.setGemeinde(evt.target.value);
        },

        setTrefferAnzahl: function (evt) {
            this.model.setTrefferAnzahl(evt.target.value);
        },

        setDirection: function (evt) {
            this.model.setDirection(evt.target.value);
        }
    });

    return AnimationView;
});
