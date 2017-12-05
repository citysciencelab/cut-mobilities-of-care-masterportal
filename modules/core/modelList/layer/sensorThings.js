define(function (require) {

    var Layer = require("modules/core/modelList/layer/model"),
        Radio = require("backbone.radio"),
        ol = require("openlayers"),
        SensorThingsLayer;

    SensorThingsLayer = Layer.extend({

        initialize: function () {
            this.superInitialize();
        },

        createLayerSource: function () {
            this.setLayerSource(new ol.source.Vector());
        },

        createClusterLayerSource: function () {
        },

        createLayer: function () {
            this.setLayer(new ol.layer.Vector({
                source: (this.has("clusterDistance") === true) ? this.getClusterLayerSource() : this.getLayerSource(),
                name: this.get("name"),
                typ: this.get("typ"),
                gfiAttributes: this.get("gfiAttributes"),
                routable: this.get("routable"),
                gfiTheme: this.get("gfiTheme"),
                id: this.getId()
            }));

            this.updateData();
        },

        createLegendURL: function () {
        },

        setAttributes: function () {
        },

                updateData: function () {
            var params = {
                REQUEST: "GetFeature",
                SERVICE: "WFS",
                SRSNAME: Radio.request("MapView", "getProjection").getCode(),
                TYPENAME: this.get("featureType"),
                VERSION: this.getVersion()
            };

            Radio.trigger("Util", "showLoader");

            $.ajax({
                url: Radio.request("Util", "getProxyURL", this.get("url")),
                data: params,
                async: true,
                type: "GET",
                context: this,
                success: function (data) {
                    Radio.trigger("Util", "hideLoader");
                    try {
                        var wfsReader = new ol.format.WFS({
                                featureNS: this.get("featureNS")
                            }),
                            features = wfsReader.readFeatures(data);

                        this.getLayerSource().addFeatures(features);
                        this.set("loadend", "ready");
                        Radio.trigger("WFSLayer", "featuresLoaded", this.getId(), features);
                        // für WFS-T wichtig --> benutzt den ol-default Style
                        if (_.isUndefined(this.get("editable")) === true || this.get("editable") === false) {
                            this.styling();
                        }
                        this.getLayer().setStyle(this.get("style"));
                    }
                    catch (e) {
                    }
                },
                error: function (jqXHR, errorText, error) {
                    Radio.trigger("Util", "hideLoader");
                }
            });
        },
    });

    return SensorThingsLayer;
});
