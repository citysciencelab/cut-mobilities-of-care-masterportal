import Layer from "./model";
import VectorLayer from "ol/layer/Vector.js";
import VectorSource from "ol/source/Vector.js";

const VectorBaseLayer = Layer.extend(/** @lends GeoJSONLayer.prototype */{
    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        isClustered: false,
        altitudeMode: "clampToGround",
        useProxy: false
    }),

    /**
     * @class GeoJSONLayer
     * @description Module to represent GeoJSONLayer
     * @extends Layer
     * @constructs
     * @memberof Core.ModelList.Layer
     * @property {Boolean} isClustered=[false] Distance to group features to clusters
     * @fires StyleList#RadioRequestReturnModelById
     * @fires MapView#RadioRequestGetProjection
     * @fires Layer#RadioTriggerVectorLayerResetFeatures
     */
    initialize: function () {

        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }
    },

    /**
     * Triggert by Layer to create a layerSource respectively a clusterLayerSource
     * @returns {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource());
    },

    /**
     * Triggert by Layer to create a ol/layer/Vector
     * @returns {void}
     */
    createLayer: function () {
        this.setLayer(new VectorLayer({
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: this.get("typ"),
            gfiAttributes: this.get("gfiAttributes"),
            id: this.get("id")
        }));
        if (this.get("isSelected")) {
            this.updateSource();
        }
        this.createLegend();
    },

    /**
     * Updating the layer source from the features of parameter
     * @returns {void}
     */
    updateSource: function () {
        this.get("layerSource").clear(true);
        this.get("layerSource").addFeatures(this.get("features"));
    },

    /**
     * Creates the legend
     * @fires VectorStyle#RadioRequestStyleListReturnModelById
     * @returns {void}
     */
    createLegend: function () {
        const styleModel = Radio.request("StyleList", "returnModelById", this.get("styleId"));
        let legend = this.get("legend");

        /**
         * @deprecated in 3.0.0
         */
        if (this.get("legendURL")) {
            console.warn("legendURL ist deprecated in 3.0.0. Please use attribute \"legend\" als Boolean or String with path to legend image or pdf");
            if (this.get("legendURL") === "") {
                legend = false;
            }
            else if (this.get("legendURL") === "ignore") {
                legend = false;
            }
            else {
                legend = this.get("legendURL");
            }
        }

        if (styleModel && legend === true) {
            styleModel.getGeometryTypeFromWFS(this.get("url"), this.get("version"), this.get("featureType"), this.get("styleGeometryType"));
            this.setLegend(styleModel.getLegendInfos());
        }
        else if (typeof legend === "string") {
            this.setLegend([legend]);
        }
    }
});

export default VectorBaseLayer;
