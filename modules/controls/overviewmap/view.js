define(function (require) {
    var OverviewmapModel = require("modules/controls/overviewmap/model"),
        template = require("text!modules/controls/overviewmap/template.html"),
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
            $(".overviewmap > div").toggle("slow");

            $(".overviewmap > .glyphicon").toggleClass("glyphicon-globe glyphicon-globe");
            if ($(".overviewmap > .glyphicon-globe").attr("title") === "Übersichtskarte ausblenden") {
                $(".ol-custom-overviewmap").hide();
                $(".overviewmap > .glyphicon-globe").attr("title", "Übersichtskarte einblenden");
                Radio.trigger("AttributionsView", "ovmHide");
            }
            else {
                $(".overviewmap > .glyphicon-globe").attr("title", "Übersichtskarte ausblenden");
                $(".ol-custom-overviewmap").show();
                Radio.trigger("AttributionsView", "ovmShow");
            }
        }
    });

    return OverviewmapView;
});
