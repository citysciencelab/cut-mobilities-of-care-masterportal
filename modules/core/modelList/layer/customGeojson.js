import Layer from "./model";
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';

const CustomGeoJSONLayer = Layer.extend({ 
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["2D"],
        showSettings: true,
        isClustered: false
    }),
    
    initialize: function () {
        if (!this.get("isChildLayer")) {
            Layer.prototype.initialize.apply(this);
        }
    
        if (this.has("clusterDistance")) {
            this.set("isClustered", true);
        }
    
        this.setStyleId(this.get("styleId") || this.get("id"));
        this.setStyleFunction(Radio.request("StyleList", "returnModelById", this.get("styleId")));
    },
    /**
     * [createLayerSource description]
     * @return {[type]} [description]
     */
    createLayerSource: function () {
        this.setLayerSource(new VectorSource({
            url: this.get("url"),
            format: new GeoJSON(),
        }));
    },

    
        /**
     * [createLayer description]
     * @return {[type]} [description]
     */
    createLayer: function () {
        this.setLayer(new VectorLayer({
            source: new VectorSource ({
                typ: "CustomGeoJSON",
                url: this.get("url"),
                format: new GeoJSON()
            }),
        }));

    },
        /**
     * sets style function for features or layer
     * @param  {Backbone.Model} stylelistmodel Model für Styles
     * @returns {undefined}
     */
    setStyleFunction: function (stylelistmodel) {
        if (_.isUndefined(stylelistmodel)) {
            this.set("styleFunction", undefined);
        }
        else {
            this.set("styleFunction", function (feature) {
                return stylelistmodel.createStyle(feature, this.get("isClustered"));
            }.bind(this));
        }
    },

    createLegendURL: function () {
    },
    checkForScale: function () {
    },
    // setter for styleId
    setStyleId: function (value) {
        this.set("styleId", value);
    },
    
    // setter for style
    setStyle: function (value) {
        this.set("style", value);
    }
});

export default CustomGeoJSONLayer;