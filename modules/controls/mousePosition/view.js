define([
    "backbone",
    "backbone.radio",
    "text!modules/controls/mousePosition/template.html"
], function (Backbone, Radio, MousePositionTemplate) {

    var MousePositionView = Backbone.View.extend({
        className: "mouse-position hidden-xs",
        template: _.template(MousePositionTemplate),
        events: {
            "click .glyphicon": "toggle"
        },
        initialize: function () {
            this.listenTo(Radio.channel("Map"), {
                "pointerMoveOnMap": this.setCoordinates
            });

            this.render();
        },
        render: function () {
            $("body").append(this.$el.html(this.template()));
        },
        setCoordinates: function (evt) {
            var coordinates = evt.map.getCoordinateFromPixel(evt.pixel),
                coordX = coordinates[0].toString(),
                coordY = coordinates[1].toString();

            $(".mouse-position > div").text(coordX.substr(0, 9) + ", " + coordY.substr(0, 10));
        },
        toggle: function () {
            $(".mouse-position > div").toggle("slow");
            $(".mouse-position > .glyphicon").toggleClass("glyphicon-chevron-right glyphicon-chevron-left");
            $(".mouse-position > .glyphicon-chevron-right").attr("title", "Einblenden");
            $(".mouse-position > .glyphicon-chevron-left").attr("title", "Ausblenden");
        }
    });

    return MousePositionView;
});
