import OverviewmapModel from "./model";
import template from "text-loader!./template.html";

const OverviewmapView = Backbone.View.extend({
    events: {
        "click .glyphicon": "toggle"
    },

    initialize: function () {
        this.render();
        this.model = new OverviewmapModel();
    },

    render: function () {
        this.$el.html(this.template());
        return this;
    },
    id: "overviewmap",
    template: _.template(template),
    /**
     * Beim Klick auf den Ovierviewmap Button wird hier der title des buttons angepasst
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

export default OverviewmapView;
