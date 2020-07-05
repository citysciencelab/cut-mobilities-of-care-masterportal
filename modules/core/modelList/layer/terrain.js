import Layer from "./model";

const TerrainLayer = Layer.extend(/** @lends TerrainLayer.prototype */{
    /**
     * @class TerrainLayer
     * @description Class to represent a cesium Terrain Dataset
     * @extends Layer
     * @constructs
     * @memberof Core.ModelList.Layer
     */
    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["3D"],
        showSettings: false,
        selectionIDX: -1
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
        let options;

        if (this.has("terrainProvider") === false) {
            options = {};
            if (this.has("cesiumTerrainProviderOptions")) {
                Object.assign(options, this.get("cesiumTerrainProviderOptions"));
            }
            options.url = this.get("url");
            this.setTerrainProvider(new Cesium.CesiumTerrainProvider(options));
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
