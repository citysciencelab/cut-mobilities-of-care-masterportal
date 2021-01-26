import Layer from "./model";
import ImageLayer from "ol/layer/Image.js";
import Projection from "ol/proj/Projection.js";
import StaticImageSource from "ol/source/ImageStatic.js";
import getProxyUrl from "../../../../src/utils/getProxyUrl";

const StaticImageLayer = Layer.extend({

    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        useProxy: false
    }),

    /**
     * Creates layer source for staticImage
     * @return {void}
     */
    createLayerSource: function () {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url"),
            extent = this.get("extent"),
            projection = new Projection({
                code: "static-image",
                units: "pixels",
                extent: extent
            });

        this.setLayerSource(new StaticImageSource({
            url: url,
            projection: projection,
            imageExtent: extent
        }));
    },

    /**
     * Creates Layer for staticImage
     * @return {void}
     */
    createLayer: function () {
        this.setLayer(new ImageLayer({
            source: this.get("layerSource"),
            name: this.get("name"),
            typ: "StaticImage",
            legendURL: this.get("legendURL"),
            transparency: this.get("transparency")
        }));
    },
    createLegendURL: function () {
        // this is a comment
    }
});

export default StaticImageLayer;
