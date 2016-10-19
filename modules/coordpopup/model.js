define([
    "backbone",
    "backbone.radio",
    "openlayers",
    "proj4",
    "config",
    "bootstrap/popover"
], function (Backbone, Radio, ol, proj4, Config) {

    var CoordPopup = Backbone.Model.extend({
         defaults: {
            element: $("#popup"),
            coordOverlay: {},
            coordinateUTM: {},
            coordinateGeo: {}
        },
        initialize: function () {
            this.listenTo(Radio.channel("Map"), {
                "setPositionCoordPopup": this.setPosition
            });

            this.setCoordOverlay(new ol.Overlay({
                element: this.getElement()[0]
            }));
            Radio.trigger("Map", "addOverlay", this.getCoordOverlay());
        },
        getCoordOverlay: function () {
            return this.get("coordOverlay");
        },
        setCoordOverlay: function (coordOverlay) {
            this.set("coordOverlay", coordOverlay);
        },
        getCoordinateUTM: function () {
            return this.get("coordinateUTM");
        },
        setCoordinateUTM: function (coordinateUTM) {
            this.set("coordinateUTM", coordinateUTM);
        },
        getCoordinateGeo: function () {
            return this.get("coordinateGeo");
        },
        setCoordinateGeo: function (coordinateGeo) {
            this.set("coordinateGeo", coordinateGeo);
        },
        getElement: function () {
            return this.get("element");
        },
        setElement: function (element) {
            this.set("element", element);
        },
        destroyPopup: function () {
            this.getElement().popover("destroy");
        },
        showPopup: function () {
            this.getElement().popover("show");
        },
        setPosition: function (coordinate) {
            this.getCoordOverlay().setPosition(coordinate);
            this.setCoordinateUTM(coordinate);
            this.setCoordinateGeo(ol.coordinate.toStringHDMS(proj4(proj4(Config.view.epsg), proj4("EPSG:4326"), this.getCoordinateUTM())));
        }
    });

    return new CoordPopup();
});
