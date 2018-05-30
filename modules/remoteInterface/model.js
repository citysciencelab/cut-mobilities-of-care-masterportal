define(function (require) {
    var Radio = require("backbone.radio"),
        Backbone = require("backbone"),
        ol = require("openlayers"),
        RemoteInterface;

    RemoteInterface = Backbone.Model.extend({
        defaults: {
            postMessageUrl: "https://localhost:8080"
        },
        initialize: function () {
            var channel = Radio.channel("RemoteInterface");

            channel.reply({
                "getMapState": this.getMapState,
                "getWGS84MapSizeBBOX": this.getWGS84MapSizeBBOX
            }, this);

            channel.on({
                "showAllFeatures": this.showAllFeatures,
                "showFeaturesById": this.showFeaturesById,
                "removeAllFeaturesFromLayer": this.removeAllFeaturesFromLayer,
                "resetView": this.resetView,
                "setModelAttributesById": this.setModelAttributesById,
                "postMessage": this.postMessage
            }, this);
            window.addEventListener("message", this.receiveMessage.bind(this));
            Radio.trigger("Map", "createVectorLayer", "gewerbeflaechen");
        },
        getPostMessageHost: function (config) {
            if (_.has(config, "postMessageUrl") && config.postMessageUrl.length > 0) {
                return this.setPostMessageUrl(config.postMessageUrl);
            }
            else {
                return this.get("postMessageUrl");
            }
        },

        /**
         * handles the postMessage events
         * @param  {MessageEvent} event
         */
        receiveMessage: function (event) {
            if (event.origin !== this.getPostMessageHost()) {
                return;
            }
            if (event.data.hasOwnProperty("showPositionByFeatureId")) {
                this.showPositionByFeatureId(event.data.showPositionByFeatureId, event.data.layerId);
            }
            else if (event.data === "hidePosition") {
                Radio.trigger("MapMarker", "hideMarker");
            }
        },
        /**
         * sends Message to remotehost via postMessage Api
         *
         * @param  {Object} content the Data to be sent
         */
        postMessage: function (content) {
            parent.postMessage(content, this.getPostMessageHost());
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
            Radio.trigger("MapView", "setCenter", center);
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
        resetView: function () {
            Radio.trigger("MapView", "resetView");
            Radio.trigger("MapMarker", "hideMarker");
        },
        getMapState: function () {
            return Radio.request("SaveSelection", "getMapState");
        },
        getWGS84MapSizeBBOX: function () {
            return Radio.request("Map", "getWGS84MapSizeBBOX");
        },
        setPostMessageUrl: function (value) {
            this.set("postMessageUrl", value);
        }
    });

    return RemoteInterface;
});
