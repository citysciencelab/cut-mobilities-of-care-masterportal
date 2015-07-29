define([
    "backbone",
    "eventbus",
    "openlayers",
    "proj4",
    "bootstrap/popover"
], function (Backbone, EventBus, ol, proj4) {

    var CoordPopup = Backbone.Model.extend({
        initialize: function () {
            EventBus.on("setPositionCoordPopup", this.setPosition, this);
            this.set("coordOverlay", new ol.Overlay({
                element: $("#popup")
            }));
            this.set("element", this.get("coordOverlay").getElement());
            EventBus.trigger("addOverlay", this.get("coordOverlay"));
            EventBus.on("mapView:replyProjection", this.setProjection, this);
            EventBus.trigger("mapView:requestProjection");
        },
        destroyPopup: function () {
            this.get("element").popover("destroy");
        },
        showPopup: function () {
            this.get("element").popover("show");
        },
        setPosition: function (coordinate) {
            this.get("coordOverlay").setPosition(coordinate);
            this.set("coordinateUTM", coordinate);
            this.set("coordinateGeo", ol.coordinate.toStringHDMS(proj4(proj4(this.get("projection").getCode()), proj4("EPSG:4326"), this.get("coordinateUTM"))));
        },
        setProjection: function (proj) {
            this.set("projection", proj);
        }
    });

    return new CoordPopup();
});
