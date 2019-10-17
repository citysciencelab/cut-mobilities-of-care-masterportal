import Tool from "../../core/modelList/tool/model";
import {getLayerWhere} from "masterportalAPI/src/rawLayerList";

const LayerSliderModel = Tool.extend(/** @lends LayerSliderModel.prototype */{
    defaults: _.extend({}, Tool.prototype.defaults, {
        layerIds: [],
        timeInterval: 2000,
        title: null,
        progressBarWidth: 10,
        activeLayer: {layerId: ""},
        windowsInterval: null,
        renderToWindow: true,
        glyphicon: "glyphicon-film"
    }),

    /**
     * @class LayerSliderModel
     * @description todo
     * @extends Tool
     * @memberOf Tools.LayerSliderModel
     * @constructs
     * @property {Array} layerIds=[] todo
     * @property {number} timeInterval=2000 todo
     * @property {*} title=null todo
     * @property {number} progressBarWidth=10 todo
     * @property {object} activeLayer={layerId: ""} todo
     * @property {*} windowsInterval=null todo
     * @property {boolean} renderToWindow=true todo
     * @property {string} glyphicon="glyphicon-film" todo
     * @listens Tools.LayerSliderModel#RadioTriggerChangeIsActive
     * @fires Alerting#RadioTriggerAlertAlert
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     */
    initialize: function () {
        const invalidLayerIds = this.checkIfAllLayersAvailable(this.get("layerIds"));

        this.superInitialize();
        this.setProgressBarWidth(this.get("layerIds"));

        if (invalidLayerIds.length > 0) {
            Radio.trigger("Alert", "alert", "Konfiguration des Werkzeuges: " + this.get("name") + " fehlerhaft. <br>Bitte prüfen Sie folgende LayerIds: " + invalidLayerIds + "!");
        }

        this.listenTo(this, {
            "change:isActive": function (model, value) {
                if (value) {
                    this.checkIfLayermodelExist(this.get("layerIds"));
                }
            }
        });
    },

    /**
     * todo
     * @returns {void}
     */
    reset: function () {
        this.stopInterval();
        this.set("activeLayer", {layerId: ""});
    },

    /**
     * Checks if the layer model already exists.
     * @param {object[]} layerIds - Configuration of the layers from config.json
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    checkIfLayermodelExist: function (layerIds) {
        _.each(layerIds, function (layer) {
            if (Radio.request("ModelList", "getModelsByAttributes", {id: layer.layerId}).length === 0) {
                this.addLayerModel(layer.layerId);
            }
        }, this);
    },

    /**
     * Adds the layer model briefly to the model to run prepareLayerObject and then removes the model again.
     * @param {string} layerId - Id of the layer
     * @fires Core.ModelList#RadioRequestModelListGetModelsByAttributes
     * @returns {void}
     */
    addLayerModel: function (layerId) {
        Radio.trigger("ModelList", "addModelsByAttributes", {id: layerId});
        this.sendModification(layerId, true);
        this.sendModification(layerId, false);
    },

    /**
     * Determines the visibility of the layerIds
     * @param {string} activeLayerId - Id des activeLayer.
     * @returns {void}
     */
    toggleLayerVisibility: function (activeLayerId) {
        _.each(this.get("layerIds"), function (layer) {
            var status = layer.layerId === activeLayerId;

            this.sendModification(layer.layerId, status);
        }, this);
    },

    /**
     * Triggers the new visibility over the radio
     * @param {string} layerId - layerId
     * @param {boolean} status - Visibility true / false
     * @returns {void}
     */
    sendModification: function (layerId, status) {
        Radio.trigger("ModelList", "setModelAttributesById", layerId, {
            isSelected: status,
            isVisibleInMap: status
        });
    },

    /**
     * Finds the index in the layerIds array to the activeLayerId or returns -1.
     * @returns {integer} - Index im Array mit activeLayerId.
     */
    getActiveIndex: function () {
        return _.findIndex(this.get("layerIds"), function (layer) {
            return layer.layerId === this.get("activeLayer").layerId;
        }, this);
    },

    /**
     * Finds the activeLayerId based on the index and initiates storage.
     * @param {integer} index - Index in layerIds.
     * @returns {void}
     */
    setActiveIndex: function (index) {
        this.setActiveLayer(this.get("layerIds")[index]);
        this.toggleLayerVisibility(this.get("activeLayer").layerId);
    },

    /**
     * Setter of the Windows interval. Binds to this.
     * @param {function} func - Function to be executed in this
     * @param {integer}  autorefreshInterval - Interval in ms
     * @returns {void}
     */
    setWindowsInterval: function (func, autorefreshInterval) {
        this.set("windowsInterval", setInterval(func.bind(this), autorefreshInterval));
    },

    /**
     * Starts the Windows interval once.
     * @returns {void}
     */
    startInterval: function () {
        var windowsInterval = this.get("windowsInterval"),
            timeInterval = this.get("timeInterval");

        if (_.isNull(windowsInterval)) {
            this.forwardLayer();
            this.setWindowsInterval(this.forwardLayer, timeInterval);
        }
    },

    /**
     * Stops the windows interval.
     * @returns {void}
     */
    stopInterval: function () {
        var windowsInterval = this.get("windowsInterval");

        if (!_.isUndefined(windowsInterval)) {
            clearInterval(windowsInterval);
            this.set("windowsInterval", null);
        }
    },

    /**
     * Finds the previous index in the array in a loop.
     * @returns {void}
     */
    backwardLayer: function () {
        var index = this.getActiveIndex(),
            max = this.get("layerIds").length - 1;

        if (index > 0) {
            this.setActiveIndex(index - 1);
        }
        else {
            this.setActiveIndex(max);
        }
    },

    /**
     * Finds the next index in the array in a loop.
     * @returns {void}
     */
    forwardLayer: function () {
        var index = this.getActiveIndex(),
            max = this.get("layerIds").length - 1;

        if (index > -1 && index < max) {
            this.setActiveIndex(index + 1);
        }
        else {
            this.setActiveIndex(0);
        }
    },

    /**
     * Checks if all layers that the layerSlider should use are also defined and have a title attribute.
     * @param {object[]} layers - Configuration of the layers from config.json
     * @fires Core.ConfigLoader#RadioRequestParserGetItemByAttributes
     * @returns {object} Invalid Layer oder undefined
     */
    checkIfAllLayersAvailable: function (layers) {
        var invalidLayers = [];

        layers.forEach(function (layerObject) {
            if (
                !getLayerWhere({id: layerObject.layerId}) ||
                !Radio.request("Parser", "getItemByAttributes", {id: layerObject.layerId})
            ) {
                invalidLayers.push(layerObject.layerId);
            }
        });

        return invalidLayers;
    },

    /**
     * Setter for isCollapsed.
     * @param {boolean} value - isCollapsed
     * @returns {void}
     */
    setIsCollapsed: function (value) {
        this.set("isCollapsed", value);
    },

    /**
     * Setter for isCurrentWin.
     * @param {boolean} value - isCurrentWin
     * @returns {void}
     */
    setIsCurrentWin: function (value) {
        this.set("isCurrentWin", value);
    },

    /**
    * Setter for layerIds.
    * @param {object[]} value - layerIds
    * @returns {void}
    */
    setLayerIds: function (value) {
        this.set("layerIds", value);
    },

    /**
    * Setter for title.
    * @param {string} value - title
    * @returns {void}
    */
    setTitle: function (value) {
        this.set("title", value);
    },

    /**
    * Setter for timeInterval.
    * @param {integer} value - timeInterval
    * @returns {void}
    */
    setTimeInterval: function (value) {
        this.set("timeInterval", value);
    },

    /**
    * Setter for progressBarWidth.
    * @param {object[]} layerIds - layerIds zum Ermitteln der width
    * @returns {void}
    */
    setProgressBarWidth: function (layerIds) {
        // Mindestbreite der ProgressBar ist 10%.
        if (layerIds.length <= 10) {
            this.set("progressBarWidth", Math.round(100 / layerIds.length));
        }
        else {
            this.set("progressBarWidth", 10);
        }
    },

    /**
    * Setter for activeLayerId.
    * @param {object} value - activeLayer
    * @returns {void}
    */
    setActiveLayer: function (value) {
        this.set("activeLayer", value);
    }
});

export default LayerSliderModel;
