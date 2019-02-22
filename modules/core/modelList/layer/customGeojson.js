import Layer from "./model";
import GeoJSON from 'ol/format/GeoJSON.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';

const CustomGeoJSONLayer = Layer.extend({
    
    /**
     * [createLayerSource description]
     * @return {[type]} [description]
     */
    createLayerSource: function () {
        console.log(1234);
        
        this.setLayerSource(new VectorSource({
            url: this.get("url"),
            format: new GeoJSON()
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
    createLegendURL: function () {
    },
    checkForScale: function () {
    }
});

export default CustomGeoJSONLayer;