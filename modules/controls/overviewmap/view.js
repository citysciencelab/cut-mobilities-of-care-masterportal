define(function (require) {

    var OverviewmapModel = require("modules/controls/overviewmap/model"),
        template = require("text!modules/controls/overviewmap/template.html"),
        OverviewmapView;

    OverviewmapView = Backbone.View.extend({
        className: "overviewmap hidden-xs",
        template: _.template(template),
        events: {
            "click .glyphicon": "toggle"
        },
        initialize: function () {
            this.model = new OverviewmapModel();
            this.render();
        },
        render: function () {
            $("body").append(this.$el.html(this.template()));

        },
        toggle: function () {
            $(".overviewmap > div").toggle("slow");
            $(".overviewmap > .glyphicon").toggleClass("glyphicon-globe glyphicon-globe");
            $(".overviewmap > .glyphicon-globe").attr("title") === "Übersichtskarte ausblenden" ?
            $(".overviewmap > .glyphicon-globe").attr("title", "Übersichtskarte einblenden") :
            $(".overviewmap > .glyphicon-globe").attr("title", "Übersichtskarte ausblenden");

        }
    });

    return OverviewmapView;
});
