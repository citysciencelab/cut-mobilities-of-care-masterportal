import SaveSelectionSimpleMapTemplate from "text-loader!./templateSimpleMap.html";
import SaveSelectionTemplate from "text-loader!./template.html";

const SaveSelectionView = Backbone.View.extend({
    events: {
        "click input": "copyToClipboard"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:isActive": this.render,
            "change:url": this.setUrlValue
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    template: _.template(SaveSelectionTemplate),
    templateSimpleMap: _.template(SaveSelectionSimpleMapTemplate),
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

    setUrlValue: function (model, value) {
        this.$("input").val(value);
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

export default SaveSelectionView;
