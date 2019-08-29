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
     * @listens Core#RadioTriggerMapChange
     * @fires Core#RadioRequestIsMap3d
     * @fires Core#RadioRequestGetMap3d
     */
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["3D"],
        showSettings: false,
        selectionIDX: -1,
        /**
         * [cesium3DTilesetDefaults description]
         * @link https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html
         * @type {Object<string, Set<(Cesium.Cesium3DTileset.options)>>}
         */
        cesium3DTilesetDefaults: {
            maximumScreenSpaceError: "6"
        },
        /**
         * [hiddenObjects description]
         * @type {Object<string, Set<(Cesium.Cesium3DTileFeature|ol.Feature)>>}
         */
        hiddenObjects: {},
        /**
         * [featureVisibilityLastUpdated description]
         * @type {number}
         */
        featureVisibilityLastUpdated: Date.now(),
        /**
         * [styleLastUpdated description]
         * @type {number}
         */
        styleLastUpdated: Date.now()
    }),

    /**
     * [initialize description]
     * @listens Core#RadioTriggerMapChange
     * @returns {void}
     */
    initialize: function () {
        Layer.prototype.initialize.apply(this);

        this.listenTo(Radio.channel("Map"), {
            "change": function (map) {
                if (map === "3D") {
                    this.toggleLayerOnMap();
                }
            }
        });

        // Hides features by id if config param has "hiddenFeatures"
        if (this.has("hiddenFeatures")) {
            this.hideObjects(this.get("hiddenFeatures"));
        }
    },

    /**
     * adds the tileset to the cesiumScene
     * @fires Core#RadioRequestIsMap3d
     * @fires Core#RadioRequestGetMap3d
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
        const options = this.combineOptions(this.get("cesium3DTilesetOptions"), this.get("url")),
            tileset = new Cesium.Cesium3DTileset(options);

        this.setTileSet(tileset);

        tileset.tileVisible.addEventListener(this.applyStyle.bind(this));
        tileset.tileUnload.addEventListener((tile) => {
            delete tile[lastUpdatedSymbol];
        });
    },

    /**
     * Combines default and config settings
     * @param   {object} cesium3DTilesetOptions config settings
     * @param   {string} url                    url
     * @returns {object} combinedOptions
     */
    combineOptions: function (cesium3DTilesetOptions, url) {
        const options = Object.assign(this.get("cesium3DTilesetDefaults"), cesium3DTilesetOptions);

        if (url && url.endsWith("tileset.json")) {
            options.url = url;
        }
        else {
            options.url = url + "/tileset.json";
        }

        return options;
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
            content[lastUpdatedSymbol] < this.get("featureVisibilityLastUpdated") ||
            content[lastUpdatedSymbol] < this.get("styleLastUpdated")
        ) {
            const batchSize = content.featuresLength;

            for (let batchId = 0; batchId < batchSize; batchId++) {
                const feature = content.getFeature(batchId);

                if (feature) {
                    let id = feature.getProperty("id");

                    if (!id) {
                        id = `${content.url}${batchId}`;
                    }

                    if (this.get("hiddenObjects")[id]) {
                        this.get("hiddenObjects")[id].add(feature);
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
     * hides a number of objects called in planing.js
     * @param {Array<string>} toHide A list of Object Ids which will be hidden
     * @return {void} -
     */
    hideObjects (toHide) {
        let dirty = false;
        const hiddenObjects = this.get("hiddenObjects");

        toHide.forEach((id) => {
            if (!hiddenObjects[id]) {
                hiddenObjects[id] = new Set();
                dirty = true;
            }
        });
        this.setHiddenObjects(hiddenObjects);
        if (dirty) {
            this.setFeatureVisibilityLastUpdated(Date.now());
        }
    },

    /**
     * unHides a number of objects
     * @param {Array<string>} unHide A list of Object Ids which will be unHidden
     * @return {void} -
     */
    showObjects (unHide) {
        const hiddenObjects = this.get("hiddenObjects");

        unHide.forEach((id) => {
            if (hiddenObjects[id]) {
                hiddenObjects[id].forEach((f) => {
                    if (f instanceof Cesium.Cesium3DTileFeature || f instanceof Cesium.Cesium3DTilePointFeature) {
                        if (this.featureExists(f)) {
                            f.show = true;
                        }
                    }
                });
                delete hiddenObjects[id];
            }
        });
        this.setHiddenObjects(hiddenObjects);
    },

    /**
     * clears all the hidden objects
     * @return {void} -
     */
    clearHiddenObjects () {
        this.showObjects(Object.keys(this.get("hiddenObjects")));
    },

    /**
     * sets a vcsStyle Object to the tileset
     * @see tools/virtualcity/planning.js
     * @param {Object} vcsStyle -
     * @return {void} -
     */
    setVectorStyle: function (vcsStyle) {
        const style = getTilesetStyle(vcsStyle),
            tileSet = this.get("tileSet");

        tileSet.style = style;
        this.setStyleLastUpdated(Date.now());
        this.setFeatureVisibilityLastUpdated(Date.now());
    },

    /**
     * Setter for the layer visibility
     * @param {Boolean} value new visibility value
     * @returns {void} -
     * @override
     */
    setVisible: function (value) {
        this.get("tileSet").show = value;
    },

    /**
     * Setter for hiddenObjects
     * @param {object} value hiddenObjects
     * @returns {void}
     */
    setHiddenObjects: function (value) {
        this.set("hiddenObjects", value);
    },

    /**
     * Setter for featureVisibilityLastUpdated
     * @param {Date} value featureVisibilityLastUpdated
     * @returns {void}
     */
    setFeatureVisibilityLastUpdated: function (value) {
        this.set("featureVisibilityLastUpdated", value);
    },

    /**
     * Setter for styleLastUpdated
     * @param {Date} value styleLastUpdated
     * @returns {void}
     */
    setStyleLastUpdated: function (value) {
        this.set("styleLastUpdated", value);
    }
});

export default TileSetLayer;
