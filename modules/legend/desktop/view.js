import LegendTemplate from "text-loader!./template.html";
import ContentTemplate from "text-loader!../content.html";

const LegendView = Backbone.View.extend({
    events: {
        "click .glyphicon-remove": "hide"
    },
    initialize: function () {
        $(window).resize(function () {
            if ($(".legend-win-content").height() !== null) {
                $(".legend-win-content").css("max-height", $(window).height() * 0.7);
            }
        });

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

        this.listenTo(Radio.channel("Map"), {
            "updateSize": this.updateLegendSize
        });
        // Bestätige, dass das Modul geladen wurde
        Radio.trigger("Autostart", "initializedModul", this.model.get("id"));
    },
    className: "legend-win",
    template: _.template(LegendTemplate),
    contentTemplate: _.template(ContentTemplate),

    /**
     * Steuert Maßnahmen zur Aufbereitung der Legende.
     * @listens this.model~change:legendParams
     * @returns {void}
     */
    paramsChanged: function () {
        var legendParams = this.model.get("legendParams");

        // Filtern von this.unset("legendParams")
        if (!_.isUndefined(legendParams) && legendParams.length > 0) {
            Radio.trigger("Layer", "updateLayerInfo", this.model.get("paramsStyleWMS").styleWMSName);
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

    render: function () {
        var attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        $("body").append(this.$el.html(this.template(attr)));
        $(".legend-win-content").css("max-height", $(".lgv-container").height() * 0.7);
        this.$el.draggable({
            containment: "#map",
            handle: ".legend-win-header"
        });
        return this;
    },

    show: function () {
        if ($("body").find(".legend-win").length === 0) {
            this.render();
        }
        this.model.setLayerList();
        this.$el.show();
    },
    hide: function () {
        this.$el.hide();
        this.model.setIsActive(false);
    },
    removeView: function () {
        this.$el.hide();
        this.remove();
    },

    /**
     * Passt die Höhe der Legende an die Klasse lgv-container an.
     * Derzeit wird die Funktion ausgeführt auf die updateSize Funtkion der Map.
     * @returns {void}
     */
    updateLegendSize: function () {
        $(".legend-win-content").css("max-height", $(".lgv-container").height() * 0.7);
    }
});

export default LegendView;
