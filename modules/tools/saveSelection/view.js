define([
    "backbone",
    "text!modules/tools/saveSelection/template.html",
    "text!modules/tools/saveSelection/templateSimpleMap.html",
    "modules/tools/saveSelection/model"
], function (Backbone, SaveSelectionTemplate, SaveSelectionSimpleMapTemplate, SaveSelection) {

    var SaveSelectionView = Backbone.View.extend({
        model: new SaveSelection(),
        className: "win-body",
        template: _.template(SaveSelectionTemplate),
        templateSimpleMap: _.template(SaveSelectionSimpleMapTemplate),
        events: {
            "click input": "copyToClipboard"
        },
        initialize: function () {
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:url": this.render
            });
        },
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                if (this.model.getSimpleMap() === true) {
                    $(".win-heading").after(this.$el.html(this.templateSimpleMap(attr)));
                }
                else {
                    $(".win-heading").after(this.$el.html(this.template(attr)));
                }
                this.delegateEvents();
            }
            else {
                this.undelegateEvents();
            }
        },

        /**
         * Kopiert den Inhalt des Event-Buttons in die Zwischenablage, sofern der Browser das Kommando akzeptiert.
         * @param  {evt} evt Evt-Button
         */
        copyToClipboard: function (evt) {
            var textField = evt.currentTarget;

            try {
                $(textField).select();
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
