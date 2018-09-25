import LegendTemplate from "text-loader!./template.html";
import ContentTemplate from "text-loader!../content.html";

const MobileLegendView = Backbone.View.extend({
    events: {
        "click .glyphicon-remove": "hide"
    },
    initialize: function () {
        this.listenTo(this.model, {
            "change:legendParams": this.paramsChanged,
            "change:paramsStyleWMSArray": this.paramsChanged,
            "change:isActive": function (model, value) {
                if (value) {
                    this.show();
                }
                else {
                    this.hide();
                }
            }
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    id: "base-modal-legend",
    className: "modal bs-example-modal-sm legend fade in",
    template: _.template(LegendTemplate),
    contentTemplate: _.template(ContentTemplate),
    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },

    /**
     * Steuert Maßnahmen zur Aufbereitung der Legende.
     * @listens this.model~change:legendParams
     * @returns {void}
     */
    paramsChanged: function () {
        var legendParams = this.model.get("legendParams");

        // Filtern von this.unset("legendParams")
        if (!_.isUndefined(legendParams) && legendParams.length > 0) {
            this.addContentHTML(legendParams);
            this.render();
        }
    },

    /**
     * Fügt den Legendendefinitionen das gerenderte HTML hinzu.
     * Dieses wird im template benötigt.
     * @param {object[]} legendParams Legendenobjekte by reference
     * @returns {void}
     */
    addContentHTML: function (legendParams) {
        _.each(legendParams, function (legendDefinition) {
            _.each(legendDefinition.legend, function (legend) {
                legend.html = this.contentTemplate(legend);
            }, this);
        }, this);
    },
    show: function () {
        if (this.$("body").find(".legend-win").length === 0) {
            this.render();
        }
        this.model.setLayerList();
        this.$el.modal("show");
    },
    hide: function () {
        this.$el.modal("hide");
        this.model.setIsActive(false);
    },

    removeView: function () {
        this.$el.modal("hide");
        this.remove();
    }
});

export default MobileLegendView;
