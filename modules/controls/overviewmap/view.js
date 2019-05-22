import OverviewMapModel from "./model";
import template from "text-loader!./template.html";

const OverviewMapView = Backbone.View.extend(/** @lends OverviewMapView.prototype */{
    events: {
        "click .glyphicon": "toggle"
    },
    /**
     * @class OverviewMapView
     * @memberof Controls.Overviewmap
     * @extends Backbone.View
     * @param {Object} el Jquery element to be rendered into.
     * @param {String} id Id of control.
     * @param {Object} attr Attributes of overviewmap.
     * @param {String} attr.baseLayer Id of baseLayer
     * @param {String} attr.resolution Resolution of baseLayer.
     * @constructs
     */
    initialize: function (el, id, attr) {
        let layerId;

        this.setElement(el);
        this.id = id;

        /**
         * baselayer
         * @deprecated in 3.0.0
         */
        if (attr.hasOwnProperty("baselayer")) {
            console.warn("OverviewMap: Attribute 'baselayer' is deprecated. Please use 'layerId'");
            layerId = attr.baselayer;
        }
        if (attr.hasOwnProperty("layerId")) {
            layerId = attr.layerId;
        }
        this.render();
        this.model = new OverviewMapModel({id: this.id, layerId: layerId, resolution: attr.resolution});
    },

    /**
     * Render function
     * @returns {OverviewMapView} - Returns itself.
     */
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    /**
     * @member OverviewMapTemplate
     * @description Template used for the OverviewMap
     * @memberof Controls.Overviewmap
     */
    template: _.template(template),

    /**
     * Toggles the title of the DOM element
     * @returns {void}
     */
    toggle: function () {
        if (this.$(".overviewmap-button > .glyphicon-globe").attr("title") === "Übersichtskarte ausblenden") {
            this.$(".ol-custom-overviewmap").hide("slow");
            this.$(".overviewmap-button > .glyphicon-globe").attr("title", "Übersichtskarte einblenden");
        }
        else {
            this.$(".overviewmap-button > .glyphicon-globe").attr("title", "Übersichtskarte ausblenden");
            this.$(".ol-custom-overviewmap").show("slow");
        }
    }
});

export default OverviewMapView;
