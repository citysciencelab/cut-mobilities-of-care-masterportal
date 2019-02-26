import {Fill, Stroke, Style} from "ol/style.js";

const HighlightFeature = Backbone.Model.extend({
    defaults: {
        polygonStyle: new Style({
            stroke: new Stroke({
                color: "#08775f",
                lineDash: [8],
                width: 4
            }),
            fill: new Fill({
                color: [8, 119, 95, 0.3]
            })
        })
    },
    initialize: function () {
        var featureToAdd = Radio.request("ParametricURL", "getHighlightFeature"),
            channel = Radio.channel("Highlightfeature"),
            temp;

        channel.on({
            "highlightfeature": this.highlightFeature,
            "highlightPolygon": this.highlightPolygon
        }, this);
        if (featureToAdd) {
            temp = featureToAdd.split(",");

            this.getAndAddFeature(temp[0], temp[1]);
        }
    },
    highlightFeature: function (featureToAdd) {
        var temp = featureToAdd.split(",");

        this.getAndAddFeature(temp[0], temp[1]);
    },
    getAndAddFeature: function (layerId, featureId) {
        var layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
            features;

        if (layer && layer.get("layerSource")) {
            features = layer.get("layerSource").getFeatures();

            if (features.length > 1) {
                this.addFeature(layer.get("layerSource").getFeatureById(featureId));
            }
            else {
                this.listenTo(Radio.channel("Layer"), {
                    "featuresLoaded": function (loadedLayerId) {
                        if (layerId === loadedLayerId) {
                            this.addFeature(layer.get("layerSource").getFeatureById(featureId));
                        }
                    }
                });
            }
        }
    },
    addFeature: function (feature) {
        var highlightLayer,
            source;

        if (feature) {
            highlightLayer = Radio.request("Map", "createLayerIfNotExists", "highlightLayer");
            source = highlightLayer.getSource();
            source.addFeatures([feature]);
            feature.setStyle(this.createStyle());
        }
    },
    createStyle: function () {
        return new Style({
            stroke: new Stroke({
                color: "#ed8804",
                width: 4
            }),
            fill: new Fill({
                color: "rgba(237, 136, 4, 0.1)"
            })
        });
    },

    /**
     * highlights a polygon feature
     * @param {ol.Feature} feature - the feature to be highlighted
     * @returns {void}
     */
    highlightPolygon: function (feature) {
        const highlightLayer = Radio.request("Map", "createLayerIfNotExists", "highlightLayer"),
            source = highlightLayer.getSource();

        highlightLayer.getSource().clear();
        feature.setStyle(this.get("polygonStyle"));
        source.addFeature(feature);
    }
});

export default HighlightFeature;
