define(function (require) {
    var OverviewmapModel = require("modules/controls/overviewmap/model"),
        template = require("text!modules/controls/overviewmap/template.html"),
        $ = require("jquery"),
        OverviewmapView;

    OverviewmapView = Backbone.View.extend({
        template: _.template(template),
        events: {
            "click .glyphicon": "toggle"
        },

        initialize: function () {
            this.model = new OverviewmapModel();
            this.render();
        },

        render: function () {
            this.$el.html(this.template());

        },

        /**
         * Beim Klick auf den Ovierviewmap Button wird hier der title des buttons angepasst
         * und getriggert, ob die map gezeigt oder versteckt wird, derzeit hört attributions darauf
         * um seine Position anzupassen
         */
        toggle: function () {
            $(".ol-custom-overviewmap").toggle("slow");
            if (this.$el.find(".glyphicon-globe").attr("title") === "Übersichtskarte ausblenden") {
                this.$el.find(".glyphicon-globe").attr("title", "Übersichtskarte einblenden");
                Radio.trigger("AttributionsView", "ovmHide");
            }
            else {
                this.$el.find(".glyphicon-globe").attr("title", "Übersichtskarte ausblenden");
                Radio.trigger("AttributionsView", "ovmShow");
            }
        }
    });

    return OverviewmapView;
});
