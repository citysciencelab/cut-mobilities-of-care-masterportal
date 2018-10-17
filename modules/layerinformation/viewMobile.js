import TemplateMobile from "text-loader!./templateMobile.html";
import ContentTemplate from "text-loader!../legend/content.html";
import "bootstrap/js/tab";
import "bootstrap/js/modal";

const LayerInformationViewMobile = Backbone.View.extend({
    events: {
        // Das Event wird ausgelöst, sobald das Modal verborgen ist
        "hidden.bs.modal": "setIsVisibleToFalse"
    },
    initialize: function () {
        this.listenTo(this.model, {
            // model.fetch() feuert das Event sync, sobald der Request erfoglreich war
            "sync": this.render,
            "removeView": this.remove
        });
    },
    className: "modal fade layerinformation",
    template: _.template(TemplateMobile),
    contentTemplate: _.template(ContentTemplate),
    render: function () {
        var attr = this.model.toJSON();

        this.addContentHTML();
        this.$el.html(this.template(attr));
        this.$el.modal("show");
        return this;
    },

    /**
     * Fügt den Legendendefinitionen das gerenderte HTML hinzu.
     * Dieses wird im template benötigt.
     * @returns {void}
     */
    addContentHTML: function () {
        var legends = this.model.get("legend");

        _.each(legends.legend, function (legend) {
            legend.html = this.contentTemplate(legend);
        }, this);
    },

    setIsVisibleToFalse: function () {
        this.model.setIsVisible(false);
    }
});

export default LayerInformationViewMobile;
