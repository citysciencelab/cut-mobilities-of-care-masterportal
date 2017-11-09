define(function (require) {

    var Radio = require("backbone.radio"),
        OverviewmapModel;

    OverviewmapModel = Backbone.Model.extend({
        defaults: {
            baselayer:"",
            newOvmView: ""
        },
        initialize: function () {
            var map =  Radio.request("Map", "getMap"),
                mapView = map.get("view"),
                layers = map.getLayers().getArray(),
                ovmConfigRes = Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}).attr,
                initVisibBaselayer = Radio.request("Parser", "getInitVisibBaselayer").id,
                newOlView;

            newOlView = new ol.View({
                center: mapView.getCenter(),
                projection: mapView.getProjection(),
                resolution: mapView.getResolution(),
                resolutions: [ovmConfigRes.resolution ? ovmConfigRes.resolution : mapView.getMaxResolution()]
            });
            this.setNewOvmView(newOlView);
            this.setBaselayer(ovmConfigRes.baselayer ? this.getBaseLayerFromMap(layers, ovmConfigRes.baselayer) : this.getBaseLayerFromMap(layers, initVisibBaselayer));
            Radio.trigger("Map", "addControl", this.newOverviewmap());
        },

        newOverviewmap: function() {
            var overviewmap = new ol.control.OverviewMap({
                    collapsible: false,
                    className: "overviewmap ol-overviewmap ol-custom-overviewmap",
                    layers: [
                      this.getOvmLayer(this.getBaselayer())
                    ],
                    view: this.getNewOvmView()
                });

            return overviewmap;
        },
        getBaseLayerFromMap: function (layers, baselayer) {
            var olLayer =_.find(layers, function(layer) {
                return layer.getProperties().id === baselayer;
            });
            return olLayer;
        },

        getOvmLayer: function (baselayer) {
            var imageLayer;

            if (baselayer instanceof ol.layer.Image === false) {
                imageLayer = new ol.layer.Image({
                    source: new ol.source.ImageWMS({
                        url: baselayer.getSource().getUrls()[0],
                        attributions: baselayer.getSource().getAttributions(),
                        params: baselayer.getSource().getParams()
                    })
                })
            }
            return imageLayer
        },

        // getter for baselayer
        getBaselayer: function () {
            return this.get("baselayer");
        },

        // setter for baselayer
        setBaselayer: function (value) {
            this.set("baselayer", value);
        },

        // getter for newOvmView
        getNewOvmView: function () {
            return this.get("newOvmView");
        },

        // setter for newOvmView
        setNewOvmView: function (value) {
            this.set("newOvmView", value);
        }

    });

    return OverviewmapModel;
});
