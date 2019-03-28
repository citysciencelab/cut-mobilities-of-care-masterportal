import OverviewMapModel from "./model";
import template from "text-loader!./template.html";

const OverviewMapView = Backbone.View.extend(/**@lends OverviewMapView.prototype */{
    events: {
        "click .glyphicon": "toggle"
    },
    /**
     * @class OverviewMapView
     * @memberof Controls.Overviewmap
     * @extends Backbone.View
     * @constructs
     */
    initialize: function () {
        this.render();
        this.model = new OverviewMapModel();
    },

    /**
     * Render function
     * @returns {OverviewMapView} - Returns itself.
     */
    render: function () {
        this.$el.html(this.template());
        return this;
    },
    id: "overviewmap",
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
