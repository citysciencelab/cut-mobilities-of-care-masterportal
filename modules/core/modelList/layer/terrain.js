import Layer from "./model";
import getProxyUrl from "../../../../src/utils/getProxyUrl";

const TerrainLayer = Layer.extend(/** @lends TerrainLayer.prototype */{
    /**
     * @class TerrainLayer
     * @description Class to represent a cesium Terrain Dataset
     * @extends Layer
     * @constructs
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     * @memberof Core.ModelList.Layer
     */
    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["3D"],
        showSettings: false,
        selectionIDX: -1,
        useProxy: false
    }),
    initialize: function () {
        Layer.prototype.initialize.apply(this);

        this.listenToOnce(Radio.channel("Map"), {
            "change": function (map) {
                if (map === "3D") {
                    this.toggleLayerOnMap();
                }
            }
        });
    },

    /**
     * adds the cesium terrain provider to the cesiumScene
     * @returns {void}
     * @override
     */
    toggleLayerOnMap: function () {
        if (Radio.request("Map", "isMap3d") === true) {
            const map3d = Radio.request("Map", "getMap3d");

            if (this.get("isVisibleInMap") === true) {
                map3d.getCesiumScene().terrainProvider = this.get("terrainProvider");
                this.createLegend();
            }
            else {
                map3d.getCesiumScene().terrainProvider = new Cesium.EllipsoidTerrainProvider({});
            }
        }
    },

    /**
     * prepares the layer Object for the rendering, in this case creates the cesium TerrainProvider
     * @returns {void} -
     * @override
     */
    prepareLayerObject: function () {
        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        const url = this.get("useProxy") ? getProxyUrl(this.get("url")) : this.get("url");
        let options;

        if (this.has("terrainProvider") === false) {
            options = {};
            if (this.has("cesiumTerrainProviderOptions")) {
                Object.assign(options, this.get("cesiumTerrainProviderOptions"));
            }
            options.url = url;
            this.setTerrainProvider(new Cesium.CesiumTerrainProvider(options));
        }
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
                legend = true;
            }
            else if (this.get("legendURL") === "ignore") {
                legend = false;
            }
            else {
                legend = this.get("legendURL");
            }
        }

        if (Array.isArray(legend)) {
            this.setLegend(legend);
        }
        else if (styleModel && legend === true) {
            this.setLegend(styleModel.getLegendInfos());
        }
        else if (typeof legend === "string") {
            this.setLegend([legend]);
        }
    },

    /**
     * Register interaction with map view. (For Tileset Layer this is not necessary)
     * @returns {void}
     * @override
     */
    registerInteractionMapViewListeners: function () {
        // do nothing
    },

    /**
     * Is not yet supported
     * @return {void} -
     * @override
     */
    updateLayerTransparency: function () {
        // do nothing
    },


    /**
     * overrides original, checks for the terrainProvider
     * @returns {Boolean} -
     * @override
     */
    isLayerValid: function () {
        return this.get("terrainProvider") !== undefined;
    },

    /**
     * overrides original, checks for the terrainProvider
     * @returns {Boolean} -
     * @override
     */
    isLayerSourceValid: function () {
        return this.get("terrainProvider") !== undefined;
    },

    /**
     * Setter for the layer visibility
     * @returns {void} -
     * @override
     */
    setVisible: function () {
        this.toggleLayerOnMap();
    },

    /**
     * @param {Cesium.TerrainProvider} value -
     * @returns {void}
     */
    setTerrainProvider: function (value) {
        this.set("terrainProvider", value);
    }
});

export default TerrainLayer;
