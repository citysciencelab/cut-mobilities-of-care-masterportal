define(function (require) {
    require("modules/core/mapView");

    var Radio = require("backbone.radio"),
        TotalviewmapModel;

    TotalviewmapModel = Backbone.Model.extend({
        defaults: {
            startCenter: Radio.request("MapView", "getCenter"),
            zoomLevel: Radio.request("MapView", "getZoomLevel")
        },

        // setter for startCenter
        setStartCenter: function (value) {
            this.set("startCenter", value);
        },

        // setter for zoomLevel
        setZoomLevel: function (value) {
            this.set("zoomLevel", value);
        }
    });

    return TotalviewmapModel;
});
