import MousePositionTemplate from "text-loader!./template.html";
import MousePositionControlModel from "./model";

const MousePositionView = Backbone.View.extend({
    events: {
        "click .glyphicon": "toggle"
    },
    initialize: function () {
        this.model = new MousePositionControlModel();
        this.listenTo(this.model, {
            "change": function () {
                const changed = this.model.changed;

                if (changed.hintText || changed.showMousePositionText || changed.hideMousePositionText) {
                    this.render();
                }
            }
        });

        Radio.trigger("Map", "registerListener", "pointermove", this.setCoordinates.bind(this), this);

        this.render();
    },
    template: _.template(MousePositionTemplate),
    render: function () {
        const attr = this.model.toJSON();

        this.$el.html(this.template(attr));
        return this;
    },
    setCoordinates: function (evt) {
        const coordinates = evt.map.getCoordinateFromPixel(evt.pixel),
            coordX = coordinates[0].toString(),
            coordY = coordinates[1].toString();

        this.$(".mouse-position > div").text(coordX.substr(0, 9) + ", " + coordY.substr(0, 10));
    },
    toggle: function () {
        this.$(".mouse-position > div").toggle("slow");
        this.$(".mouse-position > .glyphicon").toggleClass("glyphicon-chevron-right glyphicon-chevron-left");
        this.$(".mouse-position > .glyphicon-chevron-right").attr("title", this.model.get("showMousePositionText"));
        this.$(".mouse-position > .glyphicon-chevron-left").attr("title", this.model.get("hideMousePositionText"));
    }
});

export default MousePositionView;
