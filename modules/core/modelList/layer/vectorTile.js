import MVT from "ol/format/MVT";
import OpenLayersVectorTileLayer from "ol/layer/VectorTile";
import OpenLayersVectorTileSource from "ol/source/VectorTile";
import stylefunction from "ol-mapbox-style/dist/stylefunction";

import Layer from "./model";

const VectorTileLayer = Layer.extend(/** @lends VTLayer.prototype */{
    defaults: {
        ...Layer.prototype.defaults,
        selectedStyleID: undefined,
        isOutOfRange: false
    },

    /**
     * @class VectorTileLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String[]} [supported=["2D", "3D"]] Supported map modes.
     * @property {Boolean} [showSettings=true] Flag if settings selectable.
     * @fires Layer#RadioTriggerVectorLayerResetFeatures
     * @listens Layer#RadioRequestVectorLayerGetFeatures
     */
    initialize: function () {
        const mapEPSG = Radio.request("MapView", "getProjection").getCode(),
            vtEPSG = this.get("epsg");

        if (mapEPSG !== vtEPSG) {
            console.warn(`VT Layer ${this.get("name")}: Map (${mapEPSG}) and layer (${vtEPSG}) projection mismatch. View will be erroneous.`);
        }

        Layer.prototype.initialize.apply(this);
    },

    /**
     * Creates vector tile layer source.
     * @return {void}
     */
    createLayerSource: function () {
        this.setLayerSource(new OpenLayersVectorTileSource({
            format: new MVT(),
            url: this.get("url")
        }));
    },

    /**
     * Creates vector tile layer.
     * @return {void}
     */
    createLayer: function () {
        let vectorTileLayer = null;

        vectorTileLayer = new OpenLayersVectorTileLayer({
            source: this.get("layerSource"),
            id: this.get("id"),
            typ: this.get("typ"),
            name: this.get("name"),
            visible: this.get("visibility")
        });

        this.setLayer(vectorTileLayer);
        this.setConfiguredLayerStyle();
    },

    /**
     * Initially reads style information in this order:
     *     1. If field styleId in config.json, use style from services.json with that id
     *     2. If services.json has a style marked with field "defaultStyle" to true, use that style
     *     3. If neither is available, use the first style in the services.json
     *     4. If none defined, OL default style will be used implicitly
     * @returns {void}
     */
    setConfiguredLayerStyle: function () {
        let stylingPromise;

        if (this.get("styleId")) {
            this.set("selectedStyleID", this.get("styleId"));
            stylingPromise = this.setStyleByID(this.get("styleId"));
        }
        else {
            const style = this.get("vtStyles").find(({defaultStyle}) => defaultStyle) ||
                this.get("vtStyles")[0];

            if (typeof style !== "undefined") {
                this.set("selectedStyleID", style.id);
                stylingPromise = this.setStyleByDefinition(style);
            }
            else {
                console.warn(`Rendering VT layer ${this.get("name")} without style; falls back to OL default styles.`);
            }
        }

        stylingPromise
            .then(() => this.setVisible(this.get("isSelected")))
            .catch(err => console.error(err));
    },

    /**
     * Fetches a style defined for this layer in the services file.
     * @param {String} styleID id of style as defined in services.json
     * @returns {Promise} resolves void after style was set; may reject if no style found or received style invalid
     */
    setStyleByID: function (styleID) {
        const styleDefinition = this
            .get("vtStyles")
            .find(({id}) => id === styleID);

        if (!styleDefinition) {
            return Promise.reject(`No style found with ID ${styleID} for layer ${this.get("name")}.`);
        }

        return this.setStyleByDefinition(styleDefinition);
    },

    /**
     * @param {object} styleDefinition style definition as found in service.json file
     * @param {string} styleDefinition.url url where style is kept
     * @param {string} styleDefinition.id id of style
     * @returns {Promise} resolves void after style was set; may reject if received style is invalid
     */
    setStyleByDefinition: function ({id, url}) {
        return fetch(url)
            .then(response => response.json())
            .then(style => {
                // check if style is defined and required fields exist
                if (!this.isStyleValid(style)) {
                    throw new Error(
                        `Style set for VT layer is incomplete. Must feature layers, sources, and version. Received: "${JSON.stringify(style)}"`
                    );
                }

                stylefunction(this.get("layer"), style, "esri");
                this.set("selectedStyleID", id);
            });
    },

    /**
     * @param {object} style style object as fetched from a remote url
     * @returns {boolean} true if all expected fields at least exist
     */
    isStyleValid: function (style) {
        return Boolean(style) &&
            Boolean(style.layers) &&
            Boolean(style.sources) &&
            Boolean(style.version);
    },

    /**
     * NOTE Legends are currently not supported.
     * Since the layer may be restyled frontend-side
     * without the backend knowing about it, no simple
     * legend URL link can be offered.
     * @returns {void}
     */
    createLegendURL: function () {
        this.setLegendURL([]);
    }
});

export default VectorTileLayer;
