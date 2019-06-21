import Layer from "./model";
import {getTilesetStyle} from "./tilesetHelper";

/**
 * @type {symbol}
 */
var lastUpdatedSymbol = Symbol("_lastUpdated");

export {lastUpdatedSymbol};

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

        /** @type {Object<string, Set<(Cesium.Cesium3DTileFeature|ol.Feature)>>} */
        this.hiddenObjects = {};

        /** @type {number} */
        this.featureVisibilityLastUpdated = Date.now();

        /** @type {number} */
        this.styleLastUpdated = Date.now();

        if (this.has("hiddenFeatures")) {
            this.hideObjects(this.get("hiddenFeatures"));
        }
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
        var options, tileset;

        if (this.has("tileSet") === false) {
            options = {};
            if (this.has("cesium3DTilesetOptions")) {
                _.extend(options, this.get("cesium3DTilesetOptions"));
            }
            options.url = this.get("url") + "/tileset.json";
            tileset = new Cesium.Cesium3DTileset(options);
            this.setTileSet(tileset);

            if (this.get("vectorStyle")) {
                this.setVectorStyle(this.get("vectorStyle"));
            }

            tileset.tileVisible.addEventListener(this.applyStyle.bind(this));
            tileset.tileUnload.addEventListener((tile) => {
                delete tile[lastUpdatedSymbol];
            });
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
     * is called if a tile visibility event is called from the cesium tileset. Checks for Content Type and calls
     * styleContent
     * @param {tile} tile CesiumTile
     * @returns {void} -
     */
    applyStyle: function (tile) {
        if (tile.content instanceof Cesium.Composite3DTileContent) {
            for (let i = 0; i < tile.content.innerContents.length; i++) {
                this.styleContent(tile.content.innerContents[i]);
            }
        }
        else {
            this.styleContent(tile.content);
        }
    },

    /**
     * sets the current LayerStyle on the CesiumTilesetFeatures in the Tile.
     * @param {Cesium.Cesium3DTileContent} content -
     * @return {void} -
     */
    styleContent: function (content) {
        if (
            !content[lastUpdatedSymbol] ||
            content[lastUpdatedSymbol] < this.featureVisibilityLastUpdated ||
            content[lastUpdatedSymbol] < this.styleLastUpdated
        ) {
            const batchSize = content.featuresLength;

            for (let batchId = 0; batchId < batchSize; batchId++) {
                const feature = content.getFeature(batchId);

                if (feature) {
                    let id = feature.getProperty("id");

                    if (!id) {
                        id = `${content.url}${batchId}`;
                    }

                    if (this.hiddenObjects[id]) {
                        this.hiddenObjects[id].add(feature);
                        feature.show = false;
                    }
                }
            }
            content[lastUpdatedSymbol] = Date.now();
        }
    },

    /**
     * checks if a feature is still valid and not already destroyed
     * @param {Cesium.Cesium3DTileFeature|Cesium.Cesium3DTilePointFeature} feature -
     * @return {boolean} -
     */
    featureExists (feature) {
        return feature &&
            feature.content &&
            !feature.content.isDestroyed() &&
            !feature.content.batchTable.isDestroyed();
    },

    /**
     * hides a number of objects
     * @param {Array<string>} toHide A list of Object Ids which will be hidden
     * @return {void} -
     */
    hideObjects (toHide) {
        let dirty = false;

        toHide.forEach((id) => {
            if (!this.hiddenObjects[id]) {
                this.hiddenObjects[id] = new Set();
                dirty = true;
            }
        });
        if (dirty) {
            this.featureVisibilityLastUpdated = Date.now();
        }
    },

    /**
     * unHides a number of objects
     * @param {Array<string>} unHide A list of Object Ids which will be unHidden
     * @return {void} -
     */
    showObjects (unHide) {
        unHide.forEach((id) => {
            if (this.hiddenObjects[id]) {
                this.hiddenObjects[id].forEach((f) => {
                    if (f instanceof Cesium.Cesium3DTileFeature || f instanceof Cesium.Cesium3DTilePointFeature) {
                        if (this.featureExists(f)) {
                            f.show = true;
                        }
                    }
                });
                delete this.hiddenObjects[id];
            }
        });
    },

    /**
     * clears all the hidden objects
     * @return {void} -
     */
    clearHiddenObjects () {
        this.showObjects(Object.keys(this.hiddenObjects));
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
        this.styleLastUpdated = Date.now();
        this.featureVisibilityLastUpdated = Date.now();
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
