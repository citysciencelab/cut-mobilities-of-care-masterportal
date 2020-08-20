<script>
import Feature from "ol/Feature.js";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersLegend";
import mutations from "../store/mutationsLegend";
import actions from "../store/actionsLegend";
import LegendSingleLayer from "./LegendSingleLayer.vue";

export default {
    name: "LegendWindow",
    components: {
        LegendSingleLayer
    },
    computed: {
        ...mapGetters("Legend", Object.keys(getters))
    },
    watch: {
        showLegend (showLegend) {
            if (showLegend) {
                this.createLegend();
            }
        },
        layerIdForLayerInfo (layerIdForLayerInfo) {
            const layerForLayerInfo = Radio.request("ModelList", "getModelByAttributes", {type: "layer", id: layerIdForLayerInfo});
            let legendObj = null,
                isValidLegend = null;

            legendObj = {
                id: layerForLayerInfo.get("id"),
                name: layerForLayerInfo.get("name"),
                legend: this.prepareLegend(layerForLayerInfo.get("legend")),
                position: layerForLayerInfo.get("selectionIDX")
            };
            isValidLegend = this.isValidLegendObj(legendObj);

            if (isValidLegend) {
                this.setLegendForLayerInfo(legendObj);
            }
        }
    },
    mounted () {
        this.getLegendConfig();
    },
    created () {
        this.listenToLayerVisibilityChanged();
        this.listenToUpdatedSelectedLayerList();
        this.listenToLayerLegendUpdate();
    },
    updated () {
        $(this.$el).draggable({
            containment: "#map",
            handle: ".legend-title",
            start: function (event, ui) {
                ui.helper.css({
                    right: "auto",
                    bottom: "auto"
                });
            },
            stop: function (event, ui) {
                ui.helper.css({"height": "", "width": ""});
            }
        });
    },
    methods: {
        ...mapActions("Legend", Object.keys(actions)),
        ...mapMutations("Legend", Object.keys(mutations)),

        createLegend () {
            const visibleLayers = this.getVisibleLayers();

            visibleLayers.forEach(layer => this.toggleLayerInLegend(layer));
        },

        /**
         * Listens to changed layer visibility
         * @returns {void}
         */
        listenToLayerVisibilityChanged () {
            Backbone.Events.listenTo(Radio.channel("Layer"), {
                "layerVisibleChanged": (id, isVisibleInMap, layer) => {
                    this.toggleLayerInLegend(layer);
                }
            });
        },

        /**
         * Listens to updated selectedLayerList
         * @returns {void}
         */
        listenToUpdatedSelectedLayerList () {
            Backbone.Events.listenTo(Radio.channel("ModelList"), {
                "updatedSelectedLayerList": (layers) => {
                    layers.forEach(layer => this.toggleLayerInLegend(layer));
                }
            });
        },

        /**
         * Listens to changed layer legend
         * @returns {void}
         */
        listenToLayerLegendUpdate () {
            Backbone.Events.listenTo(Radio.channel("LegendComponent"), {
                "updateLegend": () => {
                    this.createLegend();
                }
            });
        },
        /**
         * Closes the legend.
         * @returns {void}
         */
        closeLegend () {
            this.setShowLegend(!this.showLegend);
        },

        /**
         * Retrieves the visible Layers from the ModelList
         * @returns {Object[]} - all Layer that are visible
         */
        getVisibleLayers () {
            return Radio.request("ModelList", "getModelsByAttributes", {type: "layer", isVisibleInMap: true});
        },

        /**
         * Generates or removed the layers legend object.
         * @param {Object} layer layer.
         * @returns {void}
         */
        toggleLayerInLegend (layer) {
            const isVisibleInMap = layer.get("isVisibleInMap"),
                layerId = layer.get("id");

            if (isVisibleInMap) {
                this.generateLegend(layer);
            }
            else {
                this.removeLegend(layerId);
            }
        },

        /**
         * Generates the legend object and adds it to the legend array in the store.
         * @param {Object} layer layer.
         * @returns {void}
         */
        generateLegend (layer) {
            const id = layer.get("id"),
                legendObj = {
                    id: id,
                    name: layer.get("name"),
                    legend: this.prepareLegend(layer.get("legend")),
                    position: layer.get("selectionIDX")
                },
                isValidLegend = this.isValidLegendObj(legendObj),
                isNotYetInLegend = isValidLegend && this.isLayerNotYetInLegend(id),
                isLegendChanged = isValidLegend && !isNotYetInLegend && this.isLegendChanged(id, legendObj);

            if (isNotYetInLegend) {
                this.addLegend(legendObj);
            }
            else if (isLegendChanged) {
                this.removeLegend(id);
                this.addLegend(legendObj);
            }
            this.sortLegend();
        },

        /**
         * Prepares the legend with the given legendInfos
         * @param {*[]} legendInfos legend Infos of layer
         * @returns {Object[]} - the prepared legend.
         */
        prepareLegend (legendInfos) {
            let preparedLegend = [];

            if (this.isArrayOfStrings(legendInfos)) {
                preparedLegend = legendInfos;
            }
            else if (Array.isArray(legendInfos)) {
                legendInfos.forEach(legendInfo => {
                    const geometryType = legendInfo.geometryType,
                        name = legendInfo.label,
                        style = legendInfo.styleObject;
                    let legendObj = {
                        name
                    };

                    if (geometryType) {

                        if (geometryType === "Point") {
                            legendObj = this.prepareLegendForPoint(legendObj, style);
                        }
                        else if (geometryType === "LineString") {
                            legendObj = this.prepareLegendForLineString(legendObj, style);
                        }
                        else if (geometryType === "Polygon") {
                            legendObj = this.prepareLegendForPolygon(legendObj, style);
                        }
                    }
                    /** Style WMS */
                    else if (legendInfo.hasOwnProperty("name") && legendInfo.hasOwnProperty("graphic")) {
                        legendObj = legendInfo;
                    }
                    preparedLegend.push(legendObj);
                });

            }
            return preparedLegend;
        },

        /**
         * Prepares the legend for point style.
         * @param {Object} legendObj The legend object.
         * @param {Object} style The styleModel.
         * @returns {Object} - prepared legendObj.
         */
        prepareLegendForPoint (legendObj, style) {
            const imgPath = style.get("imagePath"),
                type = style.get("type"),
                imageName = style.get("imageName");

            if (type === "icon") {
                legendObj.graphic = imgPath + imageName;
            }
            else if (type === "circle") {
                legendObj.graphic = this.drawCircleStyle(style);
            }
            else if (type === "interval") {
                legendObj.graphic = this.drawIntervalStyle(style);
            }
            return legendObj;
        },

        /**
         * Creates interval scaled advanced style for pointFeatures
         * @param {Object} style The styleModel.
         * @return {ol.Style} style
         */
        drawIntervalStyle (style) {
            const scalingShape = style.get("scalingShape"),
                scalingAttribute = style.get("scalingAttribute"),
                clonedStyle = style.clone();
            let intervalStyle = [];

            if (scalingShape === "CIRCLE_BAR") {
                intervalStyle = this.drawIntervalCircleBars(scalingAttribute, clonedStyle);
            }

            return intervalStyle;
        },
        /**
         * Creats an SVG for interval circle bar style.
         * @param {String} scalingAttribute attribute that contains the values of a feature
         * @param {ol.style} clonedStyle copy of style
         * @returns {String} - style as svg
         */
        drawIntervalCircleBars: function (scalingAttribute, clonedStyle) {
            const olFeature = new Feature(),
                circleBarScalingFactor = clonedStyle.get("circleBarScalingFactor"),
                barHeight = String(20 / circleBarScalingFactor);
            let style = null,
                intervalCircleBar = null;

            olFeature.set(scalingAttribute, barHeight);
            style = clonedStyle.getStyle(olFeature, false);
            intervalCircleBar = style.getImage().getSrc();

            return intervalCircleBar;
        },

        /**
         * Creates an SVG for a circle style.
         * @param   {vectorStyle} style feature styles
         * @returns {string} svg
         */
        drawCircleStyle: function (style) {
            const circleStrokeColor = style.get("circleStrokeColor") ? this.colorToRgb(style.get("circleStrokeColor")) : "black",
                circleStrokeOpacity = style.get("circleStrokeColor")[3] || 0,
                circleStrokeWidth = style.get("circleStrokeWidth"),
                circleFillColor = style.get("circleFillColor") ? this.colorToRgb(style.get("circleFillColor")) : "black",
                circleFillOpacity = style.get("circleFillColor")[3] || 0,
                circleRadius = style.get("circleRadius"),
                widthAndHeight = (circleRadius + 1.5) * 2;
            let svg = "data:image/svg+xml;charset=utf-8,";

            svg += "<svg height='" + widthAndHeight + "' width='" + widthAndHeight + "' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
            svg += "<circle cx='" + widthAndHeight / 2 + "' cy='" + widthAndHeight / 2 + "' r='" + circleRadius + "' stroke='";
            svg += circleStrokeColor;
            svg += "' stroke-opacity='";
            svg += circleStrokeOpacity;
            svg += "' stroke-width='";
            svg += circleStrokeWidth;
            svg += "' fill='";
            svg += circleFillColor;
            svg += "' fill-opacity='";
            svg += circleFillOpacity;
            svg += "'/>";
            svg += "</svg>";

            return svg;
        },

        /**
         * Prepares the legend for linestring style.
         * @param {Object} legendObj The legend object.
         * @param {Object} style The styleModel.
         * @returns {Object} - prepared legendObj.
         */
        prepareLegendForLineString (legendObj, style) {
            const strokeColor = style.get("lineStrokeColor") ? this.colorToRgb(style.get("lineStrokeColor")) : "black",
                strokeWidth = style.get("lineStrokeWidth"),
                strokeOpacity = style.get("lineStrokeColor")[3] || 0,
                strokeDash = style.get("lineStrokeDash") ? style.get("lineStrokeDash").join(" ") : undefined;
            let svg = "data:image/svg+xml;charset=utf-8,";

            svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
            svg += "<path d='M 05 30 L 30 05' stroke='";
            svg += strokeColor;
            svg += "' stroke-opacity='";
            svg += strokeOpacity;
            svg += "' stroke-width='";
            svg += strokeWidth;
            if (strokeDash) {
                svg += "' stroke-dasharray='";
                svg += strokeDash;
            }
            svg += "' fill='none'/>";
            svg += "</svg>";

            legendObj.graphic = svg;
            return legendObj;
        },

        /**
         * Prepares the legend for polygon style.
         * @param {Object} legendObj The legend object.
         * @param {Object} style The styleModel.
         * @returns {Object} - prepare legendObj
         */
        prepareLegendForPolygon (legendObj, style) {
            const fillColor = style.get("polygonFillColor") ? this.colorToRgb(style.get("polygonFillColor")) : "black",
                strokeColor = style.get("polygonStrokeColor") ? this.colorToRgb(style.get("polygonStrokeColor")) : "black",
                strokeWidth = style.get("polygonStrokeWidth"),
                fillOpacity = style.get("polygonFillColor")[3] || 0,
                strokeOpacity = style.get("polygonStrokeColor")[3] || 0;
            let svg = "data:image/svg+xml;charset=utf-8,";

            svg += "<svg height='35' width='35' version='1.1' xmlns='http://www.w3.org/2000/svg'>";
            svg += "<polygon points='5,5 30,5 30,30 5,30' style='fill:";
            svg += fillColor;
            svg += ";fill-opacity:";
            svg += fillOpacity;
            svg += ";stroke:";
            svg += strokeColor;
            svg += ";stroke-opacity:";
            svg += strokeOpacity;
            svg += ";stroke-width:";
            svg += strokeWidth;
            svg += ";'/>";
            svg += "</svg>";

            legendObj.graphic = svg;
            return legendObj;
        },

        /**
         * Returns a rgb color string that can be interpreted in SVG.
         * @param   {integer[]} color color set in style
         * @returns {string} svg color
         */
        colorToRgb: function (color) {
            return "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
        },

        /**
         * Checks if the input is an array of strings.
         * @param {*} input The input to be checked.
         * @returns {boolean} - Flag of input is an array of strings
         */
        isArrayOfStrings (input) {
            let isArrayOfStrings = false;

            if (Array.isArray(input)) {
                isArrayOfStrings = input.every(legendInfo => {
                    return typeof legendInfo === "string";
                });
            }
            return isArrayOfStrings;
        },
        /* example WMS
            {
                name: "Layername",
                legend: [
                    "https://geoportal.muenchen.de/geoserver/gsm/wms?VERSION=1.0.0&SERVICE=WMS&REQUEST=GetLegendGraphic&FORMAT=image/png&LAYER=gsm:citywise"
                ],
                position:1
            }
        */

        /* example vector
            {
                name: "Layername",
                legend: [
                    {
                        name: "foobar",
                        graphic: "<svg>...</svg>"
                    }
                ],
                position:2
            }
        */

        /**
        * Checks if given layerid is not yet in the legend.
        * @param {String} layerId Id of layer.
        * @returns {Boolean} - Flag if layer is not yet in the legend
        */
        isLayerNotYetInLegend (layerId) {
            return this.legends.filter((legendObj) => {
                return legendObj.id === layerId;
            }).length === 0;
        },

        /**
         * Checks if the legend object of the layer has changed
         * @param {String} layerId Id of layer
         * @param {Object} legendObj The legend object to be checked.
         * @returns {Boolean} - Flag if the legendObject has changed
         */
        isLegendChanged (layerId, legendObj) {
            let isLegendChanged = false;
            const layerLegend = this.legends.filter((legend) => {
                return legend.id === layerId;
            })[0];

            if (btoa(JSON.stringify(layerLegend)) !== btoa(JSON.stringify(legendObj))) {
                isLegendChanged = true;
            }

            return isLegendChanged;
        },

        /**
         * Checks if the given legend object is valid.
         * @param {Object} legendObj The legend object to be checked.
         * @returns {Boolean} - Flag if legendObject is valid.
         */
        isValidLegendObj (legendObj) {
            const legend = legendObj.legend,
                position = legendObj.position;
            let isValid = true;

            if (position < 0) {
                isValid = false;
            }
            if (typeof legend === "boolean" || !legend) {
                isValid = false;
            }
            if (Array.isArray(legend) && legend.length === 0) {
                isValid = false;
            }
            return isValid;
        }
    }
};
</script>

<template>
    <div>
        <div
            v-if="showLegend"
            id="legend-window"
        >
            <div class="legend-title">
                <span
                    :class="glyphicon"
                    class="glyphicon hidden-sm"
                />
                <span>{{ $t(name) }}</span>
                <span
                    class="glyphicon glyphicon-remove close-legend float-right"
                    @click="closeLegend"
                ></span>
            </div>
            <div class="legend-content">
                <div
                    v-for="legendObj in legends"
                    :key="legendObj.name"
                    class="layer"
                >
                    <div class="layer-title">
                        {{ legendObj.name }}
                    </div>
                    <LegendSingleLayer
                        :legendObj="legendObj"
                        :renderToId="''"
                    />
                </div>
            </div>
        </div>
        <LegendSingleLayer
            :legendObj="layerInfoLegend"
            :renderToId="'layerinfo-legend'"
        />
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    #legend-window {
        position: absolute;
        right: 100px;
        background-color: #ffffff;
        width:300px;
        .legend-title {
            padding: 10px;
            border-bottom: 2px solid #aaaaaa;
            cursor: move;
            .close-legend {
                cursor: pointer;
            }
        }
        .legend-content {
            margin-top: 2px;
            max-height: 70vh;
            overflow: auto;
            .layer {
                border: 2px solid #aaaaaa;
                margin: 2px;
                padding: 5px;
            }
            .layer-title {
                padding: 5px;
                font-weight: bold;
            }
        }
    }

</style>
