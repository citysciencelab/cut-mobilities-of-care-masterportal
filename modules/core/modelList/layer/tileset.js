import Layer from "./model";
import {getTilesetStyle} from "./tilesetHelper";

const TileSetLayer = Layer.extend(/** @lends TileSetLayer.prototype */{
    /**
     * @class TileSetLayer
     * @description Class to represent a cesium TileSet Layer
     * @extends Layer
     * @constructs
     * @memberOf Core.ModelList.Layer.Tileset
     * @property {Object} [vectorStyle="undefined"] vectorStyle
     * @listens Map#event:RadioTriggerMapChange
     */
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["3D"],
        showSettings: false,
        selectionIDX: -1
    }),
    initialize: function () {
        Layer.prototype.initialize.apply(this);

        this.listenTo(Radio.channel("Map"), {
            "change": function (map) {
                if (map === "3D") {
                    this.toggleLayerOnMap();
                }
            }
        });
    },

    /**
     * adds the tileset to the cesiumScene
     * @returns {void} -
     * @override
     */
    toggleLayerOnMap: function () {
        if (Radio.request("Map", "isMap3d") === true) {
            const map3d = Radio.request("Map", "getMap3d"),
                tileset = this.get("tileSet");

            if (this.get("isSelected") === true) {
                if (!map3d.getCesiumScene().primitives.contains(tileset)) {
                    map3d.getCesiumScene().primitives.add(tileset);
                }
            }
        }
    },

    /**
     * prepares the layer Object for the rendering, in this case creates the cesium Tileset
     * @returns {void} -
     * @override
     */
    prepareLayerObject: function () {
        var options;

        if (this.has("tileSet") === false) {
            options = {};
            if (this.has("cesium3DTilesetOptions")) {
                _.extend(options, this.get("cesium3DTilesetOptions"));
            }
            options.url = this.get("url") + "/tileset.json";
            this.setTileSet(new Cesium.Cesium3DTileset(options));

            if (this.get("vectorStyle")) {
                this.setVectorStyle(this.get("vectorStyle"));
            }
        }
    },

    /**
     * Register interaction with map view. (For Tileset Layer this is not necessary)
     * @returns {void}
     * @override
     */
    // eslint-disable-next-line no-empty-function
    registerInteractionMapViewListeners: function () {
    },

    /**
     * Is not yet supported
     * @return {void} -
     * @override
     */
    // eslint-disable-next-line no-empty-function
    updateLayerTransparency: function () {
    },


    /**
     * overrides original, checks for the tileset
     * @returns {Boolean} -
     * @override
     */
    isLayerValid: function () {
        return this.get("tileset") !== undefined;
    },

    /**
     * overrides original, checks for the tileset
     * @returns {Boolean} -
     * @override
     */
    isLayerSourceValid: function () {
        return !_.isUndefined(this.get("tileset"));
    },

    /**
     * @param {Cesium.Cesium3DTileset} value -
     * @returns {void}
     */
    setTileSet: function (value) {
        if (value) {
            value.layerReferenceId = this.get("id");
        }
        this.set("tileSet", value);
    },

    /**
     * sets a vcsStyle Object to the tileset
     * @param {Object} vcsStyle -
     * @return {void} -
     */
    setVectorStyle: function (vcsStyle) {
        const style = getTilesetStyle(vcsStyle),
            tileSet = this.get("tileSet");

        tileSet.style = style;
    },

    /**
     * Setter for the layer visibility
     * @param {Boolean} value new visibility value
     * @returns {void} -
     * @override
     */
    setVisible: function (value) {
        this.get("tileSet").show = value;
    }
});

export default TileSetLayer;
