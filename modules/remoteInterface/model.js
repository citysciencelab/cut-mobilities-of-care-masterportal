define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        ol = require("openlayers"),
        RemoteInterface;

    RemoteInterface = Backbone.Model.extend({
        initialize: function () {
            var channel = Radio.channel("RemoteInterface");

            channel.reply({
                "getMapState": this.getMapState,
                "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX
            }, this);

            channel.on({
                "showAllFeatures": this.showAllFeatures,
                "showFeaturesById": this.showFeaturesById,
                "addFeaturesFromGBM": this.addFeaturesFromGBM,
                "removeAllFeaturesFromLayer": this.removeAllFeaturesFromLayer,
                "moveMarkerToHit": this.moveMarkerToHit,
                "zoomToFeatures": this.zoomToFeatures,
                "resetView": this.resetView,
                "zoomToFeature": this.zoomToFeature,
                "setModelAttributesById": this.setModelAttributesById
            }, this);

            window.addEventListener("message", this.receiveMessage.bind(this));
            Radio.trigger("Map", "createVectorLayer", "gewerbeflaechen");
            parent.Backbone.MasterRadio = Radio;
            parent.postMessage("ready", "*");

        },
        /**
         * handles the postMessage events
         * @param  {MessageEvent} event
         */
        receiveMessage: function (event) {
            if (event.origin !== "http://localhost:8080") {
                return;
            }
            if (event.data.hasOwnProperty("showPositionByFeatureId")) {
                this.showPositionByFeatureId(event.data.showPositionByFeatureId, "55555");
            }
            else if (event.data === "hidePosition") {
                Radio.trigger("MapMarker", "hideMarker");
            }
        },
        /**
         * gets the center coordinate of the feature geometry and triggers it to MapMarker module
         * @param  {String} featureId
         * @param  {String} layerId
         */
        showPositionByFeatureId: function (featureId, layerId) {
            var model = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                feature = model.getLayerSource().getFeatureById(featureId),
                extent = feature.getGeometry().getExtent(),
                center = ol.extent.getCenter(extent);

            Radio.trigger("MapMarker", "showMarker", center);
        },
        addFeaturesFromGBM: function (hits, id, layerName) {
            Radio.trigger("AddGeoJSON", "addFeaturesFromGBM", hits, id, layerName);
        },
        showAllFeatures: function (id) {
            Radio.trigger("ModelList", "showAllFeatures", id);
        },
        showFeaturesById: function (layerId, featureIds) {
            Radio.trigger("ModelList", "showFeaturesById", layerId, featureIds);
        },
        setModelAttributesById: function (id, attributes) {
            Radio.trigger("ModelList", "setModelAttributesById", id, attributes);
        },
        removeAllFeaturesFromLayer: function () {
            Radio.trigger("Map", "removeAllFeaturesFromLayer", "gewerbeflaechen");
        },

        moveMarkerToHit: function (hit) {
            var feature = this.getFeatureFromHit(hit),
                extent = feature.getGeometry().getExtent(),
                center = ol.extent.getCenter(extent);
//                Radio.trigger("MapView", "setCenter", center);
                Radio.trigger("MapMarker", "showMarker", center);
        },
        zoomToFeature: function (hit) {
             var feature = this.getFeatureFromHit(hit),
                extent = feature.getGeometry().getExtent();

            Radio.trigger("Map", "zoomToExtent", extent);

        },
        zoomToFeatures: function (hits) {
            _.each(hits, function (hit, index) {
                hits[index] = this.getFeatureFromHit(hit);
            }, this);
            var extent = hits[0].getGeometry().getExtent().slice(0);

            hits.forEach(function (feature) {
                ol.extent.extend(extent, feature.getGeometry().getExtent());
            });
            Radio.trigger("Map", "zoomToExtent", extent);

        },
        resetView: function () {
            Radio.trigger("MapView", "resetView");
            Radio.trigger("MapMarker", "hideMarker");
        },
        getFeatureFromHit: function (hit) {
            var reader = new ol.format.GeoJSON(),
                geom = reader.readGeometry(hit.geometry_UTM_EPSG_25832, {
                    dataProjection: "EPSG:25832"
                }),
                feature = new ol.Feature({
                    geometry: geom,
                    type: hit.typ
                });
                feature.setProperties(_.omit(hit, "geometry_UTM_EPSG_25832"));
                feature.setId(hit.id);
                return feature;
        },
        getMapState: function () {
            return Radio.request("SaveSelection", "getMapState");
        },
        getWGS84MapSizeBBOX: function () {
            return Radio.request("Map", "getWGS84MapSizeBBOX");
        }
    });

    return RemoteInterface;
});
