import Layer from "./model";
import Collection from "vcs-oblique/src/vcs/oblique/collection";
import {get} from "ol/proj.js";

const ObliqueLayer = Layer.extend(/**@lends  ObliqueLayer.prototype*/{
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["none"],
        showSettings: false,
        isVisibleInTree: false
    }),
    /**
     * @class ObliqueLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String[]} supported=["none"] Shows that this layer is not supported in "2D" and "3D".
     * @property {Boolean} showSettings=false Flag that for this layer the layerinformation can not be displayed.
     * @property {Boolean} isVisibleInTree=false Flag that shows that layer is not visible in layertree.
     * @fires ObliqueMap#RadioTriggerObliqueMapRegisterLayer
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapActivateLayer
     * @fires ClickCounter#RadioTriggerClickCounterLayerVisibleChanged
     * @listens Layer#RadioTriggerLayerUpdateLayerInfo
     * @listens Layer#RadioTriggerLayerSetLayerInfoChecked
     * @listens Layer#changeIsVisibleInMap
     */
    initialize: function () {
        Radio.trigger("ObliqueMap", "registerLayer", this);
        this.listenTo(Radio.channel("Layer"), {
            "updateLayerInfo": function (name) {
                if (this.get("name") === name && this.get("layerInfoChecked") === true) {
                    this.showLayerInformation();
                }
            },
            "setLayerInfoChecked": function (layerInfoChecked) {
                this.setLayerInfoChecked(layerInfoChecked);
            }
        });

        this.listenTo(this, {
            "change:isVisibleInMap": function () {
                // triggert das Ein- und Ausschalten von Layern
                Radio.trigger("ClickCounter", "layerVisibleChanged");
                this.toggleAttributionsInterval();
            }
        });
        // set default value for resolution
        this.set("resolution", this.get("resolution") || 10);
    },

    /**
     * Returns the oblique Collection as a promise.
     * If meta data is not loaded yet, it gets loaded.
     * @returns {Promise} - Oblique Collection
     */
    getObliqueCollection: function () {
        var projection, proj, obliqueCollection, hideLevels, minZoom;

        if (this.has("obliqueCollection")) {
            return Promise.resolve(this.get("obliqueCollection"));
        }
        hideLevels = this.get("hideLevels") || 0;
        minZoom = this.get("minZoom") || 0;
        projection = Radio.request("MapView", "getProjection");
        proj = get(projection);
        obliqueCollection = new Collection({
            terrainProvider: null,
            projection: proj,
            hideLevels: hideLevels,
            minZoom: minZoom
        });
        return obliqueCollection.loadData(this.get("url")).then(function () {
            this.setObliqueCollection(obliqueCollection);
            return obliqueCollection;
        }.bind(this));
    },


    /**
     * @description Setter for attribute "obliqueCollection".
     * @param {oblique/Collection} obliqueCollection The oblique collection.
     * @returns {void}
     */
    setObliqueCollection: function (obliqueCollection) {
        this.set("obliqueCollection", obliqueCollection);
    },

    /**
     * Activates the layer in the oblique map.
     * @fires ObliqueMap#RadioRequestObliqueMapIsActive
     * @fires ObliqueMap#RadioTriggerObliqueMapActivateLayer
     * @returns {void}
     */
    activateLayerOnMap: function () {
        if (Radio.request("ObliqueMap", "isActive") === true) {
            if (this.get("isVisibleInMap") === true) {
                Radio.trigger("ObliqueMap", "activateLayer", this);
            }
        }
    },

    /**
     * Called from obliqueMap, if another oblique layer gets activated.
     * @returns {void}
     */
    deactivateLayer: function () {
        this.set("isVisibleInMap", false);
        this.set("isSelected", false);
    },

    /**
     * Setter for attribute "isVisibleInMap".
     * If layer is set visible, the function activateLayerOnMap() is called.
     * @param {boolean} value -
     * @returns {void}
     */
    setIsVisibleInMap: function (value) {
        if (value) {
            this.set("isVisibleInMap", value);
            this.activateLayerOnMap();
        }
    }
});

export default ObliqueLayer;
