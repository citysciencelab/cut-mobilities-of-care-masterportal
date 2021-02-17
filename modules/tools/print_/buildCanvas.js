import {Image, Tile, Vector, Group} from "ol/layer.js";

const BuildCanvasModel = Backbone.Model.extend(/** @lends BuildCanvasModel.prototype */{
    defaults: {},
    /**
     * Model to generate the canvas layer for the print mask
     * @class BuildCanvasModel.
     * @memberof Tools.Print
     * @extends Backbone.Model
     * @constructs
     */
    /**
     * Getting the canvas layer for the print mask
     * @param {ol.layer.Layer[]} layerList All visible layers on the map.
     * @returns {Object} - LayerObject for print mask.
     */
    getCanvasLayer: function (layerList) {
        const currentResolution = Radio.request("MapView", "getOptions").resolution,
            canvasLayerList = [];
        let canvasLayer = {};

        layerList.forEach(function (layer) {
            if (layer instanceof Group) {
                layer.getLayers().getArray().forEach(function (childLayer) {
                    canvasLayerList.push(this.buildCanvasLayerType(childLayer, currentResolution));
                }.bind(this));
            }
            else {
                canvasLayerList.push(this.buildCanvasLayerType(layer, currentResolution));
            }
        }.bind(this));

        canvasLayerList.forEach(layer => {
            if (layer instanceof Vector) {
                const visibleFeatures = layer.getSource().getFeatures().filter(feature => feature.get("isVisible"));

                if (visibleFeatures.length) {
                    canvasLayer = layer;
                }
            }
            else if (layer !== undefined) {
                canvasLayer = layer;
            }
            return canvasLayer;
        });
        return canvasLayer;
    },

    /**
     * returns canvas layer by layer type
     * @param  {ol.layer} layer ol.Layer with deatures
     * @param {Number} currentResolution Current map resolution
     * @returns {Object} - LayerObject for print mask.
     */
    buildCanvasLayerType: function (layer, currentResolution) {
        const extent = Radio.request("MapView", "getCurrentExtent"),
            layerMinRes = layer.get("minResolution"),
            layerMaxRes = layer.get("maxResolution"),
            isInScaleRange = this.isInScaleRange(layerMinRes, layerMaxRes, currentResolution);
        let features = [],
            returnLayer;

        if (isInScaleRange) {
            if (layer instanceof Image) {
                returnLayer = layer;
            }
            else if (layer instanceof Tile) {
                returnLayer = layer;
            }
            else if (layer instanceof Vector) {
                features = layer.getSource().getFeaturesInExtent(extent);

                if (features.length > 0) {
                    returnLayer = layer;
                }
            }
        }
        return returnLayer;
    },

    /**
     * Checks if layer is in the visible resolution range.
     * @param {Number} layerMinRes Maximum resolution of layer.
     * @param {Number} layerMaxRes Minimum resolution of layer.
     * @param {Number} currentResolution Current map resolution.
     * @returns {Boolean} - Flag if layer is in visible resolution.
     */
    isInScaleRange: function (layerMinRes, layerMaxRes, currentResolution) {
        let isInScale = false;

        if (layerMinRes <= currentResolution && layerMaxRes >= currentResolution) {
            isInScale = true;
        }

        return isInScale;
    }
});

export default BuildCanvasModel;
