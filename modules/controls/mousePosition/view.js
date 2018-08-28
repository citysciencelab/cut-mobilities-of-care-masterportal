define(function (require) {
    var MousePositionTemplate = require("text!modules/controls/mousePosition/template.html"),
        MousePositionView;

    MousePositionView = Backbone.View.extend({
        template: _.template(MousePositionTemplate),
        events: {
            "click .glyphicon": "toggle"
        },
        initialize: function () {
            Radio.trigger("Map", "registerListener", "pointermove", this.setCoordinates, this);

            this.render();
        },
        render: function () {
            this.$el.html(this.template());
            return this;
        },
        setCoordinates: function (evt) {
            var coordinates = evt.map.getCoordinateFromPixel(evt.pixel),
                coordX = coordinates[0].toString(),
                coordY = coordinates[1].toString();

            this.$(".mouse-position > div").text(coordX.substr(0, 9) + ", " + coordY.substr(0, 10));
        },
        toggle: function () {
            this.$(".mouse-position > div").toggle("slow");
            this.$(".mouse-position > .glyphicon").toggleClass("glyphicon-chevron-right glyphicon-chevron-left");
            this.$(".mouse-position > .glyphicon-chevron-right").attr("title", "Einblenden");
            this.$(".mouse-position > .glyphicon-chevron-left").attr("title", "Ausblenden");
        }
    });

    return MousePositionView;
});
