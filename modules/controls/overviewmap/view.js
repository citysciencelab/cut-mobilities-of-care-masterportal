define(function (require) {
    var OverviewmapModel = require("modules/controls/overviewmap/model"),
        template = require("text!modules/controls/overviewmap/template.html"),
        OverviewmapView;

    OverviewmapView = Backbone.View.extend({
        id: "overviewmap",
        template: _.template(template),
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

    return OverviewmapView;
});
