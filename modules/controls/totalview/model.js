const TotalviewmapModel = Backbone.Model.extend({
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

export default TotalviewmapModel;
