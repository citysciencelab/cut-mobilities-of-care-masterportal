import {Group as LayerGroup} from "ol/layer.js";
import Layer from "./model";
import WMSLayer from "./wms";
import WFSLayer from "./wfs";
import GeoJSONLayer from "./geojson";
import SensorLayer from "./sensor";
import HeatmapLayer from "./heatmap";

const GroupLayer = Layer.extend(/**@lends GroupLayer.prototype */{
    defaults: _.extend({}, Layer.prototype.defaults, {
        supported: ["2D", "3D"],
        showSettings: true
    }),
    /**
     * @class GroupLayer
     * @extends Layer
     * @memberof Core.ModelList.Layer
     * @constructs
     * @property {String[]} supported=["2D","3D"] Shows that group layern are supported in "2D" and "3D" mode.
     * @property {Boolean} showSettings=true Flag that shows if Layer has settings to be shown
     * @fires LayerInformation#RadioTriggerLayerInformationAdd
     * @fires Legend#RadioRequestLegendGetLegend
     */
    initialize: function () {
        Layer.prototype.initialize.apply(this);
    },

    /**
     * Creates the layersources.
     * For group layer the layersources are the children.
     * To prevent the layer sources to call layer.initialize() the flag "isChildLayer" is set to true in preparser.
     * @return {void}
     */
    createLayerSource: function () {
        var layerSource = [];

        _.each(this.get("children"), function (childLayerDefinition) {
            if (childLayerDefinition.typ === "WMS") {
                layerSource.push(new WMSLayer(childLayerDefinition));
            }
            else if (childLayerDefinition.typ === "WFS") {
                if (childLayerDefinition.outputFormat === "GeoJSON") {
                    layerSource.push(new GeoJSONLayer(childLayerDefinition));
                }
                layerSource.push(new WFSLayer(childLayerDefinition));
            }
            else if (childLayerDefinition.typ === "GeoJSON") {
                layerSource.push(new GeoJSONLayer(childLayerDefinition));
            }
            else if (childLayerDefinition.typ === "SensorThings") {
                layerSource.push(new SensorLayer(childLayerDefinition));
            }
            else if (childLayerDefinition.typ === "Heatmap") {
                layerSource.push(new HeatmapLayer(childLayerDefinition));
            }
            _.last(layerSource).prepareLayerObject();
        }, this);

        this.setLayerSource(layerSource);
    },

    /**
     * Creates the gouplayer with its layersources
     * @return {void}
     */
    createLayer: function () {
        var layers = _.map(this.get("layerSource"), function (layer) {
                return layer.get("layer");
            }),
            groupLayer = new LayerGroup({
                layers: layers,
                visible: false
            });

        this.setLayer(groupLayer);
    },

    /**
     * Creates the legendUrls of each child layer
     * @return {void}
     */
    createLegendURL: function () {
        _.each(this.get("layerSource"), function (layerSource) {
            layerSource.createLegendURL();
        }, this);
    },

    /**
     * runs the function updateSource() in all layer sources, that support this function.
     * Not all layer types support the function updateSource().
     * @returns {void}
     */
    updateSource: function () {
        _.each(this.get("layerSource"), function (layerSource) {
            if (typeof layerSource.updateSource !== "undefined") {
                layerSource.updateSource();
            }
        }, this);
    },

    /**
     * This function start the presentation of the layerinformation and legend.
     * @fires LayerInformation#RadioTriggerLayerInformationAdd
     * @fires Legend#RadioRequestLegendGetLegend
     * @returns {void}
     */
    showLayerInformation: function () {
        var metaID = [],
            legend = Radio.request("Legend", "getLegend", this),
            name = this.get("name");

        _.each(this.get("children"), function (layer) {
            var layerMetaId = layer.datasets && layer.datasets[0] ? layer.datasets[0].md_id : null;

            if (layerMetaId) {
                metaID.push(layerMetaId);
            }
        });

        Radio.trigger("LayerInformation", "add", {
            "id": this.get("id"),
            "legend": legend,
            "metaID": metaID,
            "layername": name,
            "url": null,
            "typ": null
        });

        this.setLayerInfoChecked(true);
    },

    /**
    * Checks all layer sources by scale.
    * If at least one source's min-and-max-scale is within the given scale, the attribute isOutofRange is set to false.
    * Otherwise it is set to true.
    * @param {object} options   Object mit zu prüfender .scale
    * @returns {void}
    **/
    checkForScale: function (options) {
        var isOutOfRange = true;
        _.each(this.get("layerSource"), function (layerSource) {
            if (parseFloat(options.scale, 10) <= layerSource.get("maxScale") && parseFloat(options.scale, 10) >= layerSource.get("minScale")) {
                isOutOfRange = false;
            }
        });
        this.setIsOutOfRange(isOutOfRange);
    }
});

export default GroupLayer;
