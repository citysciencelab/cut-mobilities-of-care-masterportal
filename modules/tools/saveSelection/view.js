define(function (require) {
    var SaveSelectionSimpleMapTemplate = require("text!modules/tools/saveSelection/templateSimpleMap.html"),
        SaveSelectionTemplate = require("text!modules/tools/saveSelection/template.html"),
        SaveSelectionView;

    SaveSelectionView = Backbone.View.extend({
        template: _.template(SaveSelectionTemplate),
        templateSimpleMap: _.template(SaveSelectionSimpleMapTemplate),
        events: {
            "click input": "copyToClipboard"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isActive change:url": this.render
            });
        },
        render: function (model, value) {
            if (value) {
                this.setElement(document.getElementsByClassName("win-body")[0]);
                if (this.model.get("simpleMap") === true) {
                    this.$el.html(this.templateSimpleMap(model.toJSON()));
                }
                else {
                    this.$el.html(this.template(model.toJSON()));
                }
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
            return this;
        },

        /**
         * Kopiert den Inhalt des Event-Buttons in die Zwischenablage, sofern der Browser das Kommando akzeptiert.
         * @param  {evt} evt Evt-Button
         * @returns {void}
         */
        copyToClipboard: function (evt) {
            try {
                this.$(evt.currentTarget).select();
                document.execCommand("copy");
                Radio.trigger("Alert", "alert", {
                    text: "Die Url wurde in die Zwischenablage kopiert.",
                    kategorie: "alert-info",
                    position: "top-center"
                });
            }
            catch (e) {
                console.warn("Unable to copy text to clipboard.");
            }
        }
    });

    return SaveSelectionView;
});
