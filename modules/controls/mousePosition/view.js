import MousePositionTemplate from "text-loader!./template.html";

const MousePositionView = Backbone.View.extend({
    events: {
        "click .glyphicon": "toggle"
    },
    initialize: function () {
        Radio.trigger("Map", "registerListener", "pointermove", this.setCoordinates.bind(this), this);

        this.render();
    },
    template: _.template(MousePositionTemplate),
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

export default MousePositionView;
