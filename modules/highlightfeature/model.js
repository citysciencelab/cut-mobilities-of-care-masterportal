define(function (require) {

var HighlightFeature;

HighlightFeature = Backbone.Model.extend({
        initialize: function () {
            var featureToAdd = Radio.request("ParametricURL", "getHighlightFeature");
            if(featureToAdd) {
                var temp = featureToAdd.split(",");
                this.getAndAddFeature(temp[0], temp[1]);
            }
        },
        getAndAddFeature: function (layerId, featureId) {
            var layer = Radio.request("ModelList", "getModelByAttributes", {id: layerId}),
                feature = {};
            if (layer && layer.getLayerSource()) {
                var features = layer.getLayerSource().getFeatures();
                if (features.length > 1) {
                    this.addFeature(layer.getLayerSource().getFeatureById(featureId));
                }
                else {
                    this.listenTo(Radio.channel("Layer"), {
                        "featuresLoaded": function (loadedLayerId) {
                            if (layerId === loadedLayerId) {
                                this.addFeature(layer.getLayerSource().getFeatureById(featureId));
                            }
                        }
                    });
                }
            }
        },
        addFeature: function (feature) {
            if(feature) {
                var highlightLayer = Radio.request("Map", "createLayerIfNotExists", "highlightLayer");

                source = highlightLayer.getSource();
                source.addFeatures([feature]);
                feature.setStyle(this.createStyle(feature));
            }
        },
        createStyle: function(feature) {
           return new ol.style.Style({
                stroke: new ol.style.Stroke({
                    color: "#ed8804",
                    width: 4
                }),
                fill: new ol.style.Fill({
                    color: 'rgba(237, 136, 4, 0.1)'
                })
            });
        }
    });
    return HighlightFeature;
});
