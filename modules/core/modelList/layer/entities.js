import Layer from "./model";
import getProxyUrl from "../../../../src/utils/getProxyUrl";

const EntitiesLayer = Layer.extend(/** @lends EntitiesLayer.prototype */{
    defaults: Object.assign({}, Layer.prototype.defaults, {
        supported: ["3D"],
        showSettings: false,
        selectionIDX: -1,
        useProxy: false
    }),
    /**
     * @description Class to render Cesium Entities
     * @class EntitiesLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {Object} entities
     * @property {Boolean} useProxy=false Attribute to request the URL via a reverse proxy.
     */
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
     * toggles the layer and creates the necessary resources and adds it to the 3d map
     * @returns {void}
     * @override
     */
    toggleLayerOnMap: function () {
        if (Radio.request("Map", "isMap3d") === true) {
            const map3d = Radio.request("Map", "getMap3d"),
                datasource = this.get("customDatasource");

            if (this.get("isSelected") === true) {
                if (!map3d.getDataSources().contains(datasource)) {
                    map3d.getDataSources().add(datasource);
                }
            }
        }
    },

    /**
     * prepares the layer Object for the rendering, in this case creates the cesium CustomDatasource
     * @returns {void} -
     * @override
     */
    prepareLayerObject: function () {
        if (!this.has("customDatasource")) {
            this.set("customDatasource", new Cesium.CustomDataSource());
            if (this.has("entities")) {
                const entities = this.get("entities");

                entities.forEach(this.addEntityFromOptions, this);
            }
        }
    },

    /**
     * adds an entity to this layer
     * Example modelOptions:
     * {
     *   "url": "https://hamburg.virtualcitymap.de/gltf/4AQfNWNDHHFQzfBm.glb",
     *   "attributes": {
     *     "name": "Fernsehturm.kmz"
     *   },
     *   "latitude": 53.541831,
     *   "longitude": 9.917963,
     *   "height": 10,
     *   "heading": -1.2502079000000208,
     *   "pitch": 0,
     *   "roll": 0,
     *   "scale": 5,
     *   "allowPicking": true,
     *   "show": true
     * }
     * returns the cesium Entity, see https://cesiumjs.org/Cesium/Build/Documentation/Entity.html?classFilter=entity
     *
     * @param {Object} model modelOptions
     * @returns {Cesium.Entity} cesium entity
     */
    addEntityFromOptions (model) {
        let position = "",
            headingPitchRoll = "",
            orientation = "",
            modelOptions = "",
            entityOptions = {},
            entity = "",
            heading = 0,
            pitch = 0,
            roll = 0;
        const allowPicking = typeof model.allowPicking === "boolean" ? model.allowPicking : true,
            attributes = model.attributes ? model.attributes : {};

        /**
         * @deprecated in the next major-release!
         * useProxy
         * getProxyUrl()
         */
        model.url = this.get("useProxy") ? getProxyUrl(model.url) : model.url;

        if (typeof model.url !== "string") {
            return null;
        }

        if (![model.longitude, model.latitude, model.height].every(num => typeof num === "number")) {
            return null;
        }

        position = Cesium.Cartesian3.fromDegrees(model.longitude, model.latitude, model.height);

        if (typeof model.heading === "number") {
            heading = model.heading / 180 * Math.PI;
        }

        if (typeof model.pitch === "number") {
            pitch = model.pitch / 180 * Math.PI;
        }

        if (typeof model.roll === "number") {
            roll = model.roll / 180 * Math.PI;
        }
        headingPitchRoll = new Cesium.HeadingPitchRoll(heading, pitch, roll);
        orientation = Cesium.Transforms.headingPitchRollQuaternion(position, headingPitchRoll);

        modelOptions = Object.assign(model.modelOptions || {}, {
            uri: model.url,
            scale: typeof model.scale === "number" ? model.scale : 1,
            show: true
        });

        entityOptions = {
            name: model.url,
            position,
            orientation,
            show: typeof model.show === "boolean" ? model.show : true,
            model: modelOptions
        };

        entity = this.get("customDatasource").entities.add(entityOptions);
        entity.attributes = attributes;
        entity.allowPicking = allowPicking;
        entity.layerReferenceId = this.get("id");
        return entity;
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
     * overrides original, checks for the customDatasource
     * @returns {Boolean} -
     * @override
     */
    isLayerValid: function () {
        return this.get("customDatasource") !== undefined;
    },

    /**
     * overrides original, checks for the customDatasource
     * @returns {Boolean} -
     * @override
     */
    isLayerSourceValid: function () {
        return this.get("customDatasource") !== undefined;
    },

    /**
     * Setter for the layer visibility
     * @param {Boolean} value new visibility value
     * @returns {void} -
     * @override
     */
    setVisible: function (value) {
        this.get("customDatasource").show = value;
    }
});

export default EntitiesLayer;
