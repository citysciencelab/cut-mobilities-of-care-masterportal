<script>
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
                    legend: layer.get("legend") ? layer.get("legend") : layer.get("legendURL"),
                    position: layer.get("selectionIDX")
                },
                isNotYetInLegend = this.isLayerNotYetInLegend(id);

            if (this.isValidLegendObj(legendObj) && isNotYetInLegend) {
                this.addLegend(legendObj);
            }
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
            let isValid = true;

            if (legendObj.position < 0) {
                isValid = false;
            }
            if (legendObj.legend === "" || legendObj.legend === "ignore") {
                isValid = false;
            }
            if (Array.isArray(legendObj.legend) && legendObj.legend.length === 0) {
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
                        :key="legendPart"
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
