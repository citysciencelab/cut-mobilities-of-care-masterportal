import {Group as LayerGroup} from "ol/layer.js";
import Layer from "./model";
import WMSLayer from "./wms";
import WMTSLayer from "./wmts";
import WFSLayer from "./wfs";
import GeoJSONLayer from "./geojson";
import SensorLayer from "./sensor";
import HeatmapLayer from "./heatmap";

const GroupLayer = Layer.extend(/** @lends GroupLayer.prototype */{
    defaults: Object.assign({}, Layer.prototype.defaults, {
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

        if (this.get("isVisibleInMap")) {
            this.updateSource();
        }

        this.listenTo(this, {
            "change:isVisibleInMap": function () {
                this.updateSource();
            }
        });
    },

    /**
     * Creates the layersources.
     * For group layer the layersources are the children.
     * To prevent the layer sources to call layer.initialize() the flag "isChildLayer" is set to true in preparser.
     * @return {void}
     */
    createLayerSource: function () {
        const layerSource = [];

        this.get("children").forEach(childLayerDefinition => {
            if (childLayerDefinition.typ === "WMS") {
                layerSource.push(new WMSLayer(childLayerDefinition));
            }
            else if (childLayerDefinition.typ === "WMTS") {
                layerSource.push(new WMTSLayer(childLayerDefinition));
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
            layerSource[layerSource.length - 1].prepareLayerObject();
        }, this);

        this.setLayerSource(layerSource);
    },

    /**
     * Creates the gouplayer with its layersources
     * @return {void}
     */
    createLayer: function () {
        const layers = this.get("layerSource").map(layer => {
                return layer.get("layer");
            }),
            groupLayer = new LayerGroup({
                layers: layers,
                visible: false
            });

        this.setLayer(groupLayer);
        this.createLegend();
    },

    /**
     * Creates the legend of each child layer
     * @return {void}
     */
    createLegend: function () {
        this.get("layerSource").forEach(layerSource => {
            layerSource.createLegend();
        });
    },

    /**
     * runs the function updateSource() in all layer sources, that support this function.
     * Not all layer types support the function updateSource().
     * @returns {void}
     */
    updateSource: function () {
        this.get("layerSource").forEach(layerSource => {
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
        let legend = "";
        const metaID = [],
            cswUrls = [],
            showDocUrls = [],
            name = this.get("name");

        if (!this.get("layerSource")) {
            this.prepareLayerObject();
        }
        legend = Radio.request("Legend", "getLegend", this);

        this.get("children").forEach(layer => {
            let cswUrl = null,
                showDocUrl = null,
                layerMetaId = null;

            if (layer.datasets && Array.isArray(layer.datasets) && layer.datasets[0] !== null && typeof layer.datasets[0] === "object") {
                cswUrl = layer.datasets[0].hasOwnProperty("csw_url") ? layer.datasets[0].csw_url : null;
                showDocUrl = layer.datasets[0].hasOwnProperty("show_doc_url") ? layer.datasets[0].show_doc_url : null;
                layerMetaId = layer.datasets[0].hasOwnProperty("md_id") ? layer.datasets[0].md_id : null;
            }

            metaID.push(layerMetaId);
            cswUrls.push(cswUrl);
            showDocUrls.push(showDocUrl);
        });

        Radio.trigger("LayerInformation", "add", {
            "id": this.get("id"),
            "legend": legend,
            "metaID": metaID,
            "layername": name,
            "url": null,
            "typ": null,
            "cswUrl": cswUrls[0],
            "showDocUrl": showDocUrls[0],
            "urlIsVisible": this.get("urlIsVisible")
        });

        this.setLayerInfoChecked(true);
    },

    /**
    * Checks all layer sources by scale and sets attribute isOutOfRange to true to disable the layer in tree
    * 1: Check if parent min- and max scale is met, else disable group layer
    * 2: If group layer's min- and max scales are met, check out single child layers
    * 3: If one single child layer is in range, set isOutOfRange to false
    * @param {object} options   Object mit zu prüfender .scale
    * @returns {void}
    **/
    checkForScale: function (options) {
        const currentScale = parseFloat(options.scale, 10);
        let childLayersAreOutOfRange = true,
            groupLayerIsOutOfRange = false;

        if (currentScale > parseInt(this.get("maxScale"), 10) || currentScale < parseInt(this.get("minScale"), 10)) {
            groupLayerIsOutOfRange = true;
        }
        else {
            this.get("children").forEach(layerSource => {
                if (
                    currentScale <= parseInt(layerSource.maxScale || this.defaults.maxScale, 10)
                    &&
                    currentScale >= parseInt(layerSource.minScale || this.defaults.minScale, 10)
                ) {
                    childLayersAreOutOfRange = false;
                }
            });
        }

        this.setIsOutOfRange(groupLayerIsOutOfRange || childLayersAreOutOfRange);
    }
});

export default GroupLayer;
