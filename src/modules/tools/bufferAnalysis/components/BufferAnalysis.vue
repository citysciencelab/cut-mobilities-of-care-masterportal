<script>
import Tool from "../../Tool.vue";
import getComponent from "../../../../utils/getComponent";
import {mapGetters, mapActions, mapMutations} from "vuex";
import getters from "../store/gettersBufferAnalysis";
import mutations from "../store/mutationsBufferAnalysis";
import actions from "../store/actionsBufferAnalysis";
import {ResultType} from "../store/enums";

/**
 * Tool to check if a subset of features associated to a target layer are located within or outside an applied radius to all features of a source layer.
 */
export default {
    name: "BufferAnalysis",
    components: {
        Tool
    },
    data: () => ({resultTypeEnum: ResultType}),
    computed: {
        ...mapGetters("Tools/BufferAnalysis", Object.keys(getters)),
        ...mapGetters("Map", ["map"]),
        selectedSourceLayer: {
            /**
             * getter for the computed property selectedSourceLayer
             * @returns {Object} the current selected source layer
             */
            get () {
                return this.$store.state.Tools.BufferAnalysis.selectedSourceLayer;
            },
            /**
             * setter for the computed property selectedSourceLayer
             * @param {Object} newLayerSelection the new selected source layer
             * @returns {void}
             */
            set (newLayerSelection) {
                try {
                    this.applySelectedSourceLayer(newLayerSelection);
                }
                catch (e) {
                    Radio.trigger("Alert", "alert", {
                        text: e.message,
                        kategorie: "alert-warning",
                        position: "top-center",
                        fadeOut: 5000
                    });
                }
            }
        },
        selectedTargetLayer: {
            /**
             * getter for the computed property selectedTargetLayer
             * @returns {Object} the current selected target layer
             */
            get () {
                return this.$store.state.Tools.BufferAnalysis.selectedTargetLayer;
            },
            /**
             * setter for the computed property selectedTargetLayer
             * @param {Object} newLayerSelection the new selected target layer
             * @returns {void}
             */
            set (newLayerSelection) {
                try {
                    this.applySelectedTargetLayer(newLayerSelection);
                }
                catch (e) {
                    Radio.trigger("Alert", "alert", {
                        text: e.message,
                        kategorie: "alert-warning",
                        position: "top-center",
                        fadeOut: 5000
                    });
                }
            }
        },
        resultType: {
            /**
             * getter for the computed property resultType
             * @returns {ResultType} the current selected result type
             */
            get () {
                return this.$store.state.Tools.BufferAnalysis.resultType;
            },
            /**
             * setter for the computed property resultType
             * @param {ResultType} newType the new selected result type
             * @returns {void}
             */
            set (newType) {
                this.setResultType(newType);
            }
        },
        bufferRadius: {
            /**
             * getter for the computed property bufferRadius
             * @returns {Number} the current adjusted buffer radius
             */
            get () {
                return this.$store.state.Tools.BufferAnalysis.bufferRadius;
            },
            /**
             * setter for the computed property bufferRadius
             * @param {Number} newRadius the new adjusted buffer radius
             * @returns {void}
             */
            set (newRadius) {
                this.applyBufferRadius(newRadius);
            }
        }
    },
    watch: {
        /**
         * Watches the value of selectedTargetLayer
         * deselects the previous selected target layer if it exists and a new selection is made
         * @param {Object} layer the new selected target layer
         * @param {Object} prev the previous selected target layer
         * @returns {void}
         */
        selectedTargetLayer (layer, prev) {
            if (prev && layer) {
                prev.setIsSelected(false);
            }
        },
        /**
         * Watches the value of selectedSourceLayer
         * deselects the previous selected source layer if it exists and the new selected layer is falsy
         * @param {Object} layer the new selected source layer
         * @param {Object} prev the previous selected source layer
         * @returns {void}
         */
        selectedSourceLayer (layer, prev) {
            if (prev && !layer) {
                prev.setIsSelected(false);
            }
        }
    },
    /**
     * Lifecycle hook:
     * - initializes the JSTS parser
     * - loads available options for selections
     * - adds a "close"-Listener to close the tool.
     * @returns {void}
     */
    created () {
        this.initJSTSParser();
        this.loadSelectOptions();
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/BufferAnalysis", Object.keys(mutations)),
        ...mapActions("Tools/BufferAnalysis", Object.keys(actions)),
        ...mapActions("Map", ["toggleLayerVisibility"]),
        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.removeGeneratedLayers();
            this.resetModule();
            this.setActive(false);
            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.id);

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
        :initialWidth="initialWidth"
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="layer-analysis"
            >
                <label
                    for="layer-analysis-select-source"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.bufferAnalysis.sourceSelectLabel") }}</label>
                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select-source"
                        v-model="selectedSourceLayer"
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
                >{{ $t("modules.tools.bufferAnalysis.rangeLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <input
                        id="layer-analysis-range-text"
                        v-model="bufferRadius"
                        :disabled="!selectedSourceLayer || selectedTargetLayer"
                        min="0"
                        max="3000"
                        class="font-arial form-control input-sm pull-left"
                        type="number"
                    >
                    <input
                        id="layer-analysis-range"
                        v-model="bufferRadius"
                        :disabled="!selectedSourceLayer || selectedTargetLayer"
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
                >{{ $t("modules.tools.bufferAnalysis.resultTypeLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-result-type"
                        v-model="resultType"
                        class="font-arial form-control input-sm pull-left"
                        :disabled="!selectedSourceLayer || !bufferRadius || selectedTargetLayer"
                    >
                        <option
                            :value="resultTypeEnum.WITHIN"
                        >
                            {{ $t("modules.tools.bufferAnalysis.overlapping") }}
                        </option>
                        <option
                            :value="resultTypeEnum.OUTSIDE"
                        >
                            {{ $t("modules.tools.bufferAnalysis.notOverlapping") }}
                        </option>
                    </select>
                </div>

                <label
                    for="layer-analysis-select-target"
                    class="col-md-5 col-sm-5 control-label"
                >{{ $t("modules.tools.bufferAnalysis.targetSelectLabel") }}</label>

                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select-target"
                        v-model="selectedTargetLayer"
                        class="font-arial form-control input-sm pull-left"
                        :disabled="!selectedSourceLayer || !bufferRadius"
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
                        class="pull-right"
                        :class="!selectedSourceLayer ? 'btn-lgv-grey' : 'btn-primary'"
                        :disabled="!selectedSourceLayer"
                        @click="resetModule"
                    >
                        {{ $t("modules.tools.bufferAnalysis.clearBtn") }}
                    </button>
                </div>

                <div class="col-md-12 col-sm-12 form-group form-group-sm">
                    <button
                        id="layer-analysis-save-button"
                        class="pull-right"
                        :class="!selectedSourceLayer || !selectedTargetLayer || !bufferRadius ? 'btn-lgv-grey' : 'btn-primary'"
                        :disabled="!selectedSourceLayer || !selectedTargetLayer || !bufferRadius"
                        @click="buildUrlFromToolState"
                    >
                        {{ $t("modules.tools.bufferAnalysis.saveBtn") }}
                    </button>
                </div>
                <div class="col-md-12 col-sm-12 form-group form-group-sm">
                    <input
                        id="layer-analysis-saved-url"
                        v-model="savedUrl"
                        class="col-md-12 col-sm-12 form-group form-group-sm"
                        readonly
                        :hidden="!savedUrl"
                        type="text"
                        @click="copyToClipboard($event.currentTarget)"
                    >
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    // @import "~variables";
</style>
