<script>
import Tool from "../../Tool.vue";
import getComponent from "../../../../utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersLayerOverlapAnalysis";
import mutations from "../store/mutationsLayerOverlapAnalysis";
import actions from "../store/actionsLayerOverlapAnalysis";

/**
 * Tool to check if a subset of features associated to a target layer are located within or outside an applied radius to all features of a source layer.
 */
export default {
    name: "LayerOverlapAnalysis",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/LayerOverlapAnalysis", Object.keys(getters)),
        ...mapGetters("Map", ["map"]),
        sourceLayerSelection: {
            get () {
                return this.selectedSourceLayer;
            },
            set (newLayerSelection) {
                this.applySelectedSourceLayer(newLayerSelection);
            }
        },
        targetLayerSelection: {
            get () {
                return this.selectedTargetLayer;
            },
            set (newLayerSelection) {
                this.applySelectedTargetLayer(newLayerSelection);
            }
        },
        inputResultType: {
            get () {
                return this.resultType;
            },
            set (newType) {
                this.setResultType(newType);
            }
        },
        inputBufferRadius: {
            get () {
                return this.bufferRadius;
            },
            set (newRadius) {
                this.applyInputBufferRadius(newRadius);
            }
        }
    },
    watch: {
        targetLayerSelection (layer, prev) {
            if (prev && layer) {
                prev.setIsSelected(false);
            }
        },
        sourceLayerSelection (layer, prev) {
            if (prev && !layer) {
                prev.setIsSelected(false);
            }
        }
    },

    /**
     * Lifecycle hook: adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/LayerOverlapAnalysis", Object.keys(mutations)),
        ...mapActions("Tools/LayerOverlapAnalysis", Object.keys(actions)),
        ...mapActions("Map", ["toggleLayerVisibility"]),
        resetModule () {
            this.inputBufferRadius = 0;
            this.sourceLayerSelection = null;
            this.targetLayerSelection = null;
            this.removeGeneratedLayers();
        },
        // saveLayer () {
        //     const geoJson = new GeoJSON(),
        //         text = geoJson.writeFeatures(this.resultLayer.getSource().getFeatures());
        //     console.log(text);
        //
        // },
        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);
            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.LayerOverlapAnalysis.id);

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="name"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="layer-analysis"
            >
                <label
                    for="layer-analysis-select"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerOverlapAnalysis.sourceSelectLabel") }}</label>
                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select"
                        v-model="sourceLayerSelection"
                        class="font-arial form-control input-sm pull-left"
                    >
                        <option
                            v-for="layer in selectOptions"
                            :key="layer.get('id')"
                            :value="layer"
                        >
                            {{ layer.get("name") }}
                        </option>
                    </select>
                </div>
                <label
                    for="layer-analysis-range"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerOverlapAnalysis.rangeLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <input
                        id="layer-analysis-range-text"
                        v-model="inputBufferRadius"
                        :disabled="!sourceLayerSelection || targetLayerSelection"
                        min="0"
                        max="3000"
                        class="font-arial form-control input-sm pull-left"
                        type="number"
                    >
                    <input
                        id="layer-analysis-range"
                        v-model="inputBufferRadius"
                        :disabled="!sourceLayerSelection || targetLayerSelection"
                        min="0"
                        max="3000"
                        step="10"
                        class="font-arial form-control input-sm pull-left"
                        type="range"
                    >
                </div>

                <label
                    for="layer-analysis-result-type"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerOverlapAnalysis.resultTypeLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-result-type"
                        v-model="inputResultType"
                        class="font-arial form-control input-sm pull-left"
                        :disabled="!sourceLayerSelection || !inputBufferRadius || targetLayerSelection"
                    >
                        <option
                            :value="true"
                        >
                            {{ $t("modules.tools.layerOverlapAnalysis.overlapping") }}
                        </option>
                        <option
                            :value="false"
                        >
                            {{ $t("modules.tools.layerOverlapAnalysis.notOverlapping") }}
                        </option>
                    </select>
                </div>

                <label
                    for="layer-analysis-select-target"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.layerOverlapAnalysis.targetSelectLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select-target"
                        v-model="targetLayerSelection"
                        class="font-arial form-control input-sm pull-left"
                        :disabled="!sourceLayerSelection || !inputBufferRadius || targetLayerSelection"
                    >
                        <option
                            v-for="layer in selectOptions"
                            :key="layer.get('id')"
                            :value="layer"
                        >
                            {{ layer.get("name") }}
                        </option>
                    </select>
                </div>

                <div class="col-md-12 col-sm-12 form-group form-group-sm">
                    <button
                        id="layer-analysis-reset-button"
                        class="btn-primary pull-right"
                        :disabled="!sourceLayerSelection"
                        @click="resetModule()"
                    >
                        {{ $t("modules.tools.layerOverlapAnalysis.clearBtn") }}
                    </button>
                </div>

                <!--                <div class="col-md-12 col-sm-12 form-group form-group-sm">-->
                <!--                    <button-->
                <!--                        id="layer-analysis-save-button"-->
                <!--                        class="btn-primary pull-right"-->
                <!--                        :disabled="!sourceLayerSelection || !targetLayerSelection || !inputBufferRadius"-->
                <!--                        @click="saveLayer()"-->
                <!--                    >-->
                <!--                        {{ $t("modules.tools.layerOverlapAnalysis.saveBtn") }}-->
                <!--                    </button>-->
                <!--                </div>-->
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    // @import "~variables";
</style>
