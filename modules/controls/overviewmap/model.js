import ImageWMS from "ol/source/ImageWMS.js";
import Image from "ol/layer/Image.js";
import View from "ol/View.js";
import {OverviewMap} from "ol/control.js";

const OverviewMapModel = Backbone.Model.extend(/** @lends OverviewMapModel.prototype */{
    defaults: {
        id: "",
        layerId: "",
        isInitOpen: true,
        isOpen: false,
        mapControl: undefined
    },
    /**
     * @class OverviewMapModel
     * @memberof Controls.Overviewmap
     * @extends Backbone.Model
     * @constructs
     * @param {Object} [attr] configuration object defined in config.json
     * @param {String} [attr.layerId=baselayer] layerId to use in map
     * @param {Boolean} [attr.isInitOpen=true] Flag to open or disable map control on startup
     * @param {Float} [attr.resolution=maxResolution] Resolution to use in map control
     * @fires Core#RadioRequestMapGetMap
     * @fires MapView#RadioRequestMapViewGetResolutions
     * @fires Parser#RadioRequestParserGetInitVisibBaseLayer
     * @fires Core#RadioTriggerMapAddControl
     * @fires Core#RadioTriggerMapRemoveControl
     * @fires RawLayerList#RadioRequestRawLayerListGetLayerWhere
     * @fires AlertingModel#RadioTriggerAlertAlert
     */
    initialize: function (attr) {
        /**
         * baselayer
         * @deprecated in 3.0.0
         */
        if (attr.hasOwnProperty("baselayer")) {
            console.warn("OverviewMap: Attribute 'baselayer' is deprecated. Please use 'layerId'");
            this.setLayerId(attr.baselayer);
        }
    },

    /**
     * Creates and sets the mapControl only once and sets it to the map
     * @fires Core#RadioTriggerMapAddControl
     * @returns {void}
     */
    showControl: function () {
        let mapControl;

        if (!this.get("mapControl")) {
            mapControl = this.createOverviewMap();
            this.setMapControl(mapControl);
        }
        this.setIsOpen(true);
        Radio.trigger("Map", "addControl", this.get("mapControl"));
    },

    /**
     * Removes the mapControl from map
     * @fires Core#RadioTriggerMapRemoveControl
     * @returns {void}
     */
    removeControl: function () {
        this.setIsOpen(false);
        Radio.trigger("Map", "removeControl", this.get("mapControl"));
    },

    /**
     * Returns an overviewMap
     * @fires Core#RadioRequestMapGetMap
     * @fires MapView#RadioRequestMapViewGetResolutions
     * @fires Parser#RadioRequestParserGetInitVisibBaseLayer
     * @returns {void}
     */
    createOverviewMap: function () {
        const id = this.get("id"),
            map = Radio.request("Map", "getMap"),
            maxResolution = _.first(Radio.request("MapView", "getResolutions")),
            mapView = map.getView(),
            layers = map.getLayers().getArray(),
            initVisibBaselayer = Radio.request("Parser", "getInitVisibBaselayer"),
            initVisibBaselayerId = _.isUndefined(initVisibBaselayer) === false ? initVisibBaselayer.id : initVisibBaselayer,
            baselayer = this.get("layerId") ? this.getBaseLayerFromCollection(layers, this.get("layerId")) : this.getBaseLayerFromCollection(layers, initVisibBaselayerId),
            newOlView = new View({
                center: mapView.getCenter(),
                projection: mapView.getProjection(),
                resolution: mapView.getResolution(),
                resolutions: [this.get("resolution") ? this.get("resolution") : maxResolution]
            });

        if (!baselayer) {
            console.error("Missing layerID " + baselayer + " for OverviewMap");
            Radio.trigger("Alert", "alert", "Die Overviewmap konnte nicht erstellt werden.");

            return false;
        }

        return this.newOverviewmap(id, baselayer, newOlView);
    },

    /**
     * Creates a new overview map.
     * @param {String} id Element-Id to combine map with HTLMElement
     * @param {String} baselayer [description] layer to use in map
     * @param {ol.View} ovmView View to use with overlay
     * @returns {ol/control/OverviewMap} - The generated overview map.
     */
    newOverviewmap: function (id, baselayer, ovmView) {
        const overviewmap = new OverviewMap({
            collapsible: false,
            className: "ol-overviewmap ol-custom-overviewmap",
            target: id,
            layers: [
                this.getOvmLayer(baselayer)
            ],
            view: ovmView
        });

        return overviewmap;
    },

    /**
     * @description Derives the baselayer from the given layer collection
     * @param {Layer[]} layers The Array of layers
     * @param {string} baselayer The id of the baselayer
     * @fires RawLayerList#RadioRequestRawLayerListGetLayerWhere
     * @returns {object} - Baselayer params.
     */
    getBaseLayerFromCollection: function (layers, baselayer) {
        var modelFromCollection,
            baseLayerParams;

        modelFromCollection = Radio.request("RawLayerList", "getLayerWhere", {id: baselayer});
        if (_.isUndefined(modelFromCollection) === false) {
            baseLayerParams = {
                layerUrl: modelFromCollection.get("url"),
                params: {
                    t: new Date().getMilliseconds(),
                    zufall: Math.random(),
                    LAYERS: modelFromCollection.get("layers"),
                    FORMAT: modelFromCollection.get("format") === "nicht vorhanden" ? "image/png" : modelFromCollection.get("format"),
                    VERSION: modelFromCollection.get("version"),
                    TRANSPARENT: modelFromCollection.get("transparent").toString()
                }
            };
        }

        return baseLayerParams;
    },

    /**
     * Creates the layer for the overview map
     * @param {string} baselayer Id of baselayer
     * @returns {ol/Image} - The open layer image layer
     */
    getOvmLayer: function (baselayer) {
        var imageLayer;

        if (baselayer instanceof Image === false) {
            imageLayer = new Image({
                source: new ImageWMS({
                    url: baselayer.layerUrl,
                    params: baselayer.params
                })
            });
        }

        return imageLayer;
    },

    // setter for MapControl
    setMapControl: function (value) {
        this.set("mapControl", value);
    },

    // setter for layerId
    setLayerId: function (value) {
        this.set("layerId", value);
    },

    // setter for isOpen
    setIsOpen: function (value) {
        this.set("isOpen", value);
    }
});

export default OverviewMapModel;
