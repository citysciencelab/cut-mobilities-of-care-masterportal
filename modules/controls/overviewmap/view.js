define(function (require) {

    var OverviewmapModel = require("modules/controls/overviewmap/model"),
        template = require("text!modules/controls/overviewmap/template.html"),
        Radio = require("backbone.radio"),
        OverviewmapView;

    OverviewmapView = Backbone.View.extend({
        className: "overviewmap hidden-xs",
        template: _.template(template),
        events: {
            "click .glyphicon": "toggle"
        },

        initialize: function () {
            var channel = Radio.channel("Overviewmap");

            this.model = new OverviewmapModel();
            this.render();
        },

        render: function () {
            $("body").append(this.$el.html(this.template()));

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
                $(".overviewmap > .glyphicon-globe").attr("title", "Übersichtskarte einblenden");
                Radio.trigger("Overviewmap", "show");
            }
            else {
                $(".overviewmap > .glyphicon-globe").attr("title", "Übersichtskarte ausblenden");
                Radio.trigger("Overviewmap", "hide");
            }
        }
    });

    return OverviewmapView;
});
