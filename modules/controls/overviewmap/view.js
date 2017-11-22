define(function (require) {

    var OverviewmapModel = require("modules/controls/overviewmap/model"),
        template = require("text!modules/controls/overviewmap/template.html"),
        Radio = require("backbone.radio"),
        OverviewmapView;

    OverviewmapView = Backbone.View.extend({
        template: _.template(template),
        events: {
            "click .glyphicon": "toggle"
        },

        initialize: function () {
            var channel = Radio.channel("Overviewmap");

            this.model = new OverviewmapModel();
            this.render();
        },

        render: function () {console.log(this.$el);
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
                Radio.trigger("Overviewmap", "hide");
            }
            else {
                $(".overviewmap > .glyphicon-globe").attr("title", "Übersichtskarte ausblenden");
                $(".ol-custom-overviewmap").show();
                Radio.trigger("Overviewmap", "show");
            }
        }
    });

    return OverviewmapView;
});
