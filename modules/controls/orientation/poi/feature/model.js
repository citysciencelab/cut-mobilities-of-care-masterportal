define([
    "backbone",
    "backbone.radio"
], function (Backbone, Radio) {

    var PointOfInterest = Backbone.Model.extend({
        initialize: function () {
        },
        setCenter: function () {
            var zoom;

            if (this.get("distance") < 500) {
                zoom = 7;
            }
            else if (this.get("distance") > 500 && this.get("distance") < 1000) {
                zoom = 7;
            }
            else {
                zoom = 7;
            }
            Radio.trigger("poi", "hidePOIModal");
            Radio.trigger("orientation", "untrack");
            Radio.trigger("MapView", "setCenter", [parseInt(this.get("xCoord"), 10), parseInt(this.get("yCoord"), 10)], zoom);
        }
    });

    return PointOfInterest;
});
