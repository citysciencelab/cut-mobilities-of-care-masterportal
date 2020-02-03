import StyleModel from "./style.js";
import {Style, Fill, Stroke} from "ol/style.js";

const PolygonStyleModel = StyleModel.extend(/** @lends PolygonStyleModel.prototype */{
    /**
     * @description Class to create ol.style.Style
     * @class PolygonStyleModel
     * @extends StyleModel
     * @memberof VectorStyle.Style
     * @constructs
     * @property {ol/feature} feature Feature to be styled.
     * @property {object} styles styling properties to overwrite defaults
     * @property {Boolean} isClustered Flag to show if feature is clustered.
     */
    defaults: {
        "polygonStrokeColor": [0, 0, 0, 1],
        "polygonStrokeWidth": 1,
        "polygonFillColor": [10, 200, 100, 0.5]
    },

    initialize: function (feature, styles, isClustered) {
        this.setFeature(feature);
        this.setIsClustered(isClustered);
        this.overwriteStyling(styles);
    },

    /**
    * This function returns a style for each feature.
    * @returns {ol/style} - The created style.
    */
    getStyle: function () {
        return new Style({
            stroke: new Stroke({
                color: this.get("polygonStrokeColor"),
                width: this.get("polygonStrokeWidth")
            }),
            fill: new Fill({
                color: this.get("polygonFillColor")
            })
        });
    }
});

export default PolygonStyleModel;
