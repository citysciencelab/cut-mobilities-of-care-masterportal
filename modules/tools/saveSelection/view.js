define(function (require) {
    var SaveSelectionSimpleMapTemplate = require("text!modules/tools/saveSelection/templateSimpleMap.html"),
        SaveSelectionTemplate = require("text!modules/tools/saveSelection/template.html"),
        SaveSelection = require("modules/tools/saveSelection/model"),
        $ = require("jquery"),
        SaveSelectionView;

    SaveSelectionView = Backbone.View.extend({
        events: {
            "click input": "copyToClipboard"
        },
        initialize: function (attr) {
            this.model = new SaveSelection(attr);
            this.listenTo(this.model, {
                "change:isCollapsed change:isCurrentWin change:url": this.render
            });
        },
        className: "win-body",
        template: _.template(SaveSelectionTemplate),
        templateSimpleMap: _.template(SaveSelectionSimpleMapTemplate),
        render: function () {
            var attr = this.model.toJSON();

            if (this.model.get("isCurrentWin") === true && this.model.get("isCollapsed") === false) {
                this.$el.html("");
                if (this.model.get("simpleMap") === true) {
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
            return this;
        },

        /**
         * Kopiert den Inhalt des Event-Buttons in die Zwischenablage, sofern der Browser das Kommando akzeptiert.
         * @param  {evt} evt Evt-Button
         * @returns {void}
         */
        copyToClipboard: function (evt) {
            Radio.trigger("Util", "copyToClipboard", evt.currentTarget);
        }
    });

    return SaveSelectionView;
});
