import {Fill, Stroke, Style} from "ol/style.js";

const HighlightFeatureModel = Backbone.Model.extend(/** @lends HighlightFeatureModel.prototype */{
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
    /**
     * @class HighlightFeatureModel
     * @extends Backbone.Model
     * @memberof HighlightFeature
     * @constructs
     * @property {Style} polygonStyle Default style to hightlight a feature
     * @fires ParametricURL#RadioRequestParametricURLGetHighlightFeature
     * @fires Map#RadioRequestMapCreateLayerIfNotExists
     * @fires List#RadioRequestModelListGetModelByAttributes
     * @listens Layer#RadioTriggerLayerFeaturesLoaded
     * @listens HighlightFeature#RadioTriggerHighlightfeatureHighlightFeature
     * @listens HighlightFeature#RadioTriggerHighlightfeatureHighlightPolygon
     */
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
    /**
     * Hightlights a specific feature
     * @param {String} featureToAdd String with comma seperated information about the feature to add "layerId, featureId"
     * @return {void}
     */
    highlightFeature: function (featureToAdd) {
        var temp = featureToAdd.split(",");

        this.getAndAddFeature(temp[0], temp[1]);
    },
    /**
     * Searches the feature which shall be hightlighted
     * @param {String} layerId Id of the layer, containing the feature to hightlight
     * @param {String} featureId Id of feature which shall be hightlighted
     * @fires List#RadioRequestModelListGetModelByAttributes
     * @listens Layer#RadioTriggerLayerFeaturesLoaded
     * @return {void}
     */
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
    /**
     * Adds the feature to a layer that has the hightlight style. If layer does not exist, it will be created.
     * @param {ol.Feature} feature feature which shall be added to the hightlight-layer
     * @fires Map#RadioRequestMapCreateLayerIfNotExists
     * @return {void}
     */
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
    /**
     * Creates a style for highlighting features
     * @return {Style} returns new Style with stroke and fill
     */
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
     * @param {ol.Feature} feature the feature to be highlighted
     * @fires Map#RadioRequestMapCreateLayerIfNotExists
     * @return {void}
     */
    highlightPolygon: function (feature) {
        const highlightLayer = Radio.request("Map", "createLayerIfNotExists", "highlightLayer"),
            source = highlightLayer.getSource();

        highlightLayer.getSource().clear();
        feature.setStyle(this.get("polygonStyle"));
        source.addFeature(feature);
    }
});

export default HighlightFeatureModel;
