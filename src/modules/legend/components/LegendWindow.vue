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
            else {
                this.clearLegends();
            }
        }
    },
    mounted () {
        this.getLegendConfig();
    },
    created () {
        Backbone.Events.listenTo(Radio.channel("Layer"), {
            "layerVisibleChanged": (id, isVisibleInMap, layer) => {
                if (this.showLegend) {
                    this.toggleLayerInLegend(layer);
                }
            }
        });
    },
    methods: {
        ...mapActions("Legend", Object.keys(actions)),
        ...mapMutations("Legend", Object.keys(mutations)),
        // This is for closing the legend from the legend window
        // toggleLegend () {
        //     this.setShowLegend(!this.showLegend);
        // },
        getVisibleLayers () {
            return Radio.request("ModelList", "getModelsByAttributes", {type: "layer", isVisibleInMap: true});
        },
        toggleLayerInLegend (layer) {
            if (layer.get("isVisibleInMap")) {
                this.generateLegend(layer);
            }
            else {
                this.removeLegend(layer.get("name"));
                // console.log(this.legends);
            }
        },
        generateLegend (layer) {
            const legendObj = this.generateLegendObj(layer);

            if (this.isValidLegendObj(legendObj)) {
                this.addLegend(legendObj);
                // console.log(this.legends);
            }
        },
        generateLegendObj (layer) {
            const name = layer.get("name"),
                legend = layer.get("legendURL"),
                position = layer.get("selectionIDX"),
                legendObj = {
                    name,
                    legend,
                    position
                };

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
            return legendObj;
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
        id="LegendWindow"
    >
        <div class="legendTitle">
            <span
                :class="glyphicon"
                class="glyphicon hidden-sm"
            />
            <span>{{ $t("menu.legend") }}</span>
        </div>
        <div class="legendContent">
            <span>FOOBAR</span>
        </div>
    </div>
</template>

<style lang="less" scoped>
    @import "~variables";

    #LegendWindow {
        position: absolute;
        left: 0px;
        background-color: #ffffff;
    }
</style>
