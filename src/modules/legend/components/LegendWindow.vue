<script>
import Feature from "ol/Feature.js";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersLegend";
import mutations from "../store/mutationsLegend";
import actions from "../store/actionsLegend";

export default {
    name: "LegendWindow",
    components: {},
    computed: {
        ...mapGetters("Legend", Object.keys(getters))
    },
    watch: {
        showLegend (showLegend) {
            if (showLegend) {
                const visibleLayers = this.getVisibleLayers();

                visibleLayers.forEach(layer => this.toggleLayerInLegend(layer));
            }
        }
    },
    mounted () {
        this.getLegendConfig();
    },
    created () {
        Backbone.Events.listenTo(Radio.channel("Layer"), {
            "layerVisibleChanged": (id, isVisibleInMap, layer) => {
                this.toggleLayerInLegend(layer);
            }
        });
    },
    methods: {
        ...mapActions("Legend", Object.keys(actions)),
        ...mapMutations("Legend", Object.keys(mutations)),
        closeLegend () {
            this.setShowLegend(!this.showLegend);
        },
        getVisibleLayers () {
            return Radio.request("ModelList", "getModelsByAttributes", {type: "layer", isVisibleInMap: true});
        },
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
        generateLegend (layer) {
            const id = layer.get("id"),
                legendObj = {
                    id: id,
                    name: layer.get("name"),
                    legend: this.prepareLegend(layer.get("legend")),
                    position: layer.get("selectionIDX")
                },
                isNotYetInLegend = this.isLayerNotYetInLegend(id);

            if (this.isValidLegendObj(legendObj) && isNotYetInLegend) {
                this.addLegend(legendObj);
            }
        },
        prepareLegend (legendInfos) {
            let preparedLegend = [];

            if (this.isArrayOfStrings(legendInfos) || typeof legendInfos === "boolean" || !legendInfos) {
                preparedLegend = legendInfos;
            }
            else {
                legendInfos.forEach(legendInfo => {
                    const geometryType = legendInfo.geometryType,
                        name = legendInfo.label,
                        styleObj = legendInfo.styleObject;
                    let legendObj = {
                        name
                    };

                    if (geometryType === "Point") {
                        legendObj = this.prepareLegendForPoint(legendObj, styleObj);
                    }
                    preparedLegend.push(legendObj);
                });

            }
            return preparedLegend;
        },
        prepareLegendForPoint (legendObj, styleObj) {
            const imgPath = styleObj.get("imagePath"),
                type = styleObj.get("type"),
                imageName = styleObj.get("imageName");

            if (type === "icon") {
                legendObj.graphic = imgPath + imageName;
            }
            else if (type === "interval") {
                legendObj.graphic = this.drawIntervalStyle(styleObj);
            }
            return legendObj;
        },
        drawIntervalStyle (style) {
            const scalingShape = style.get("scalingShape"),
                scalingAttribute = style.get("scalingAttribute"),
                clonedStyle = style.clone();
            let intervalStyle = [];

            // set the background of the SVG transparent
            // necessary because the image is in the background and the SVG on top of this
            // if (clonedStyle.get("imageName") !== "blank.png") {
            //     clonedStyle.setCircleSegmentsBackgroundColor([
            //         255, 255, 255, 0
            //     ]);
            // }
            if (scalingShape === "CIRCLE_BAR") {
                intervalStyle = this.drawIntervalCircleBars(scalingAttribute, clonedStyle);
            }

            return intervalStyle;
        },
        /**
         * Draw advanced styles for interval circle bars in legend
         * @param {String} scalingAttribute attribute that contains the values of a feature
         * @param {ol.style} clonedStyle copy of style
         * @param {String} layername Name des Layers
         * @param {Array} image should contain the image source for legend elements
         * @param {Array} name should contain the names for legend elements
         * @returns {Array} allItems
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
        isArrayOfStrings (legendInfos) {
            let isArrayOfStrings = false;

            if (Array.isArray(legendInfos)) {
                isArrayOfStrings = legendInfos.every(legendInfo => {
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
        isLayerNotYetInLegend (layerId) {
            return this.legends.filter((legendObj) => {
                return legendObj.id === layerId;
            }).length === 0;
        },
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
    <div
        v-if="showLegend"
        id="legend-window"
    >
        <div class="legend-title">
            <span
                :class="glyphicon"
                class="glyphicon hidden-sm"
            />
            <span>{{ $t("menu.legend") }}</span>
            <span
                class="glyphicon glyphicon-remove close-legend float-right"
                @click="closeLegend"
            ></span>
        </div>
        <div class="legend-content">
            <div
                v-for="legendObj in legends"
                :key="legendObj.name"
            >
                <div class="layer-title">
                    {{ legendObj.name }}
                </div>
                <div class="layer-legend">
                    <div
                        v-for="legendPart in legendObj.legend"
                        :key="JSON.stringify(legendPart)"
                    >
                        <!--Legend as Image-->
                        <img
                            v-if="(typeof legendPart === 'string' && !legendPart.endsWith('.pdf'))"
                            :src="legendPart"
                        >

                        <!--Legend PDF as Link-->
                        <a
                            v-if="(typeof legendPart === 'string' && legendPart.endsWith('.pdf'))"
                            :href="legendPart"
                            target="_blank"
                        >
                            {{ legendPart }}
                        </a>

                        <!--Legend as Image from Object-->
                        <img
                            v-if="(typeof legendPart === 'object')"
                            :src="legendPart.graphic"
                        >
                        <span
                            v-if="(typeof legendPart === 'object')"
                        >{{ legendPart.name }}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    #legend-window {
        position: absolute;
        right: 100px;
        background-color: #ffffff;
        width:300px;
        padding: 10px;
        .legend-title {
            padding-bottom: 10px;
            border-bottom: 1px solid #000000;
            .close-legend {
                cursor: pointer;
            }
        }
        .legend-content {
            padding-top: 10px;
            .layer-title {

            }
            .layer-legend {

            }
        }
    }

</style>
