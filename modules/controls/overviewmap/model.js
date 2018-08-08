define(function (require) {

    var ol = require("openlayers"),
        $ = require("jquery"),
        OverviewmapModel;

    OverviewmapModel = Backbone.Model.extend({
        defaults: {
            baselayer: "",
            ovMap: ""
        },
        initialize: function () {
            var map = Radio.request("Map", "getMap"),
                layers = map.getLayers().getArray(),
                ovmConfig = Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}),
                ovmConfigRes = _.isUndefined(ovmConfig) === false ? ovmConfig.attr : ovmConfig,
                initVisibBaselayer = Radio.request("Parser", "getInitVisibBaselayer"),
                initVisibBaselayerId = _.isUndefined(initVisibBaselayer) === false ? initVisibBaselayer.id : initVisibBaselayer,
                newOlView,
                ovMap;

            newOlView = this.createOlView();
            this.setBaselayer(ovmConfigRes.baselayer ? this.getBaseLayerFromCollection(layers, ovmConfigRes.baselayer) : this.getBaseLayerFromCollection(layers, initVisibBaselayerId));
            ovMap = this.newOverviewmap(newOlView);
            this.setOvMap(ovMap);
            if (_.isUndefined(this.getBaselayer()) === false) {
                Radio.trigger("Map", "addControl", ovMap);
            }
            else {
                $("#overviewmap").remove();
            }
            this.listenTo(Radio.channel("Map"), {
                "change": this.mapChanged
            });
        },
        createOlView: function (value) {
            var map = Radio.request("Map", "getMap"),
                maxResolution = _.first(Radio.request("MapView", "getResolutions")),
                mapView = map.getView(),
                ovmConfig = Radio.request("Parser", "getItemByAttributes", {id: "overviewmap"}),
                ovmConfigRes = _.isUndefined(ovmConfig) === false ? ovmConfig.attr : ovmConfig,
                newOlView;

            newOlView = new ol.View({
                center: mapView.getCenter(),
                projection: mapView.getProjection(),
                resolution: mapView.getResolution(),
                resolutions: [ovmConfigRes.resolution ? ovmConfigRes.resolution : maxResolution]
            });

            this.setBaselayer(ovmConfigRes.baselayer ? this.getBaseLayerFromCollection(layers, ovmConfigRes.baselayer) : this.getBaseLayerFromCollection(layers, initVisibBaselayerId));
            if (_.isUndefined(this.get("baselayer")) === false) {
                Radio.trigger("Map", "addControl", this.newOverviewmap(newOlView));
            }
            else {
                $("#overviewmap").remove();
            }
        },
        mapChanged: function (value) {
            var view = this.createOlView(value),
                ovMap = this.newOverviewmap(view);

            Radio.trigger("Map", "removeControl", this.get("ovMap"));
            this.setOvMap(ovMap);
            Radio.trigger("Map", "addControl", ovMap);

        },
        newOverviewmap: function (view) {
            var overviewmap = new ol.control.OverviewMap({
                collapsible: false,
                className: "overviewmap ol-overviewmap ol-custom-overviewmap hidden-xs",
                layers: [
                    this.getOvmLayer(this.get("baselayer"))
                ],
                view: view
            });

            return overviewmap;
        },

        getBaseLayerFromCollection: function (layers, baselayer) {
            var modelFromCollection,
                baseLayerParams;

            modelFromCollection = Radio.request("RawLayerList", "getLayerWhere", {id: baselayer});
            if (_.isUndefined(modelFromCollection) === false) {
                baseLayerParams = {
                    layerUrl: modelFromCollection.get("url"),
                    params: {
                        t: new Date().getMilliseconds(),
                        zufall: Math.random(),
                        LAYERS: modelFromCollection.get("layers"),
                        FORMAT: modelFromCollection.get("format") === "nicht vorhanden" ? "image/png" : modelFromCollection.get("format"),
                        VERSION: modelFromCollection.get("version"),
                        TRANSPARENT: modelFromCollection.get("transparent").toString()
                    }
                };
            }
            else {
                Radio.trigger("Alert", "alert", "Die Overviewmap konnte nicht erstellt werden da kein Layer für die angegebene ID gefunden wurde. (" + baselayer + ")");
            }
            return baseLayerParams;
        },

        getOvmLayer: function (baselayer) {
            var imageLayer;

            if (baselayer instanceof ol.layer.Image === false) {
                imageLayer = new ol.layer.Image({
                    source: new ol.source.ImageWMS({
                        url: baselayer.layerUrl,
                        params: baselayer.params
                    })
                });
            }

            return imageLayer;
        },

        // setter for baselayer
        setBaselayer: function (value) {
            this.set("baselayer", value);
        },

        // setter for ovMap
        setOvMap: function (value) {
            this.set("ovMap", value);
        }
    });

    return OverviewmapModel;
});
