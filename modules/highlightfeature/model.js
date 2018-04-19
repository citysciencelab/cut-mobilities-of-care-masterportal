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
                    this.addFeature(features);
                }
                else {
                    this.listenTo(Radio.channel("Layer"), {
                        "featuresLoaded": function (loadedLayerId, features) {
                            if (layerId === loadedLayerId) {
                                this.addFeature(features, featureId);
                            }
                        }
                    });
                }
            }
        },
        addFeature: function (features, featureId) {
            var feature = _.find(features, function (feature) {
                return feature.get("id") === featureId;
            });
            if(feature) {
                var highlightLayer = Radio.request("Map", "createLayerIfNotExists", "highlightLayer");

                source = highlightLayer.getSource();
                source.addFeatures([feature]);
                feature.setStyle(this.createStyle(feature));
            }
        },
        createStyle: function(feature) {
           return new ol.style.Style({
                stroke: new ol.style.Stroke({ color: "#F00" })
            });
        }
    });
    return HighlightFeature;
});
