import StyleModel from "./style.js";
import {Style, Stroke} from "ol/style.js";

const LinestringStyleModel = StyleModel.extend(/** @lends LinestringStyleModel.prototype */{
    /**
     * @description Class to create ol.style.Style
     * @class LinestringStyleModel
     * @extends StyleModel
     * @memberof VectorStyle.Style
     * @constructs
     * @property {ol/feature} feature Feature to be styled.
     * @property {object} styles styling properties to overwrite defaults
     * @property {Boolean} isClustered Flag to show if feature is clustered.
     */
    defaults: {
        "lineStrokeColor": [255, 0, 0, 1],
        "lineStrokeWidth": 5,
        "lineStrokeCap": "round",
        "lineStrokeJoin": "round",
        "lineStrokeDash": undefined,
        "lineStrokeDashOffset": 0,
        "lineStrokeMiterLimit": 10
    },

    initialize: function (feature, styles, isClustered) {
        this.setFeature(feature);
        this.setIsClustered(isClustered);
        this.overwriteStyling(styles);
    },

    /**
    * This function returns a style for each feature.
    * @returns {ol/style/Style} - The created style.
    */
    getStyle: function () {
        return new Style({
            stroke: new Stroke({
                lineCap: this.get("lineStrokeCap"),
                lineJoin: this.get("lineStrokeJoin"),
                lineDash: this.get("lineStrokeDash"),
                lineDashOffset: this.get("lineStrokeDashOffset"),
                miterLimit: this.get("lineStrokeMiterLimit"),
                color: this.get("lineStrokeColor"),
                width: this.get("lineStrokeWidth")
            })
        });
    }
});

export default LinestringStyleModel;
