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
            get () {
                return this.$store.state.Tools.BufferAnalysis.selectedSourceLayer;
            },
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
            get () {
                return this.$store.state.Tools.BufferAnalysis.selectedTargetLayer;
            },
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
            get () {
                return this.$store.state.Tools.BufferAnalysis.resultType;
            },
            set (newType) {
                this.setResultType(newType);
            }
        },
        bufferRadius: {
            get () {
                return this.$store.state.Tools.BufferAnalysis.bufferRadius;
            },
            set (newRadius) {
                this.applyBufferRadius(newRadius);
            }
        }
    },
    watch: {
        selectedTargetLayer (layer, prev) {
            if (prev && layer) {
                prev.setIsSelected(false);
            }
        },
        selectedSourceLayer (layer, prev) {
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
        this.initJSTSParser();
        this.loadSelectOptions();
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/BufferAnalysis", Object.keys(mutations)),
        ...mapActions("Tools/BufferAnalysis", Object.keys(actions)),
        ...mapActions("Map", ["toggleLayerVisibility"]),
        saveLayer () {
            const toolState = {
                applySelectedSourceLayer: this.selectedSourceLayer.id,
                applyInputBufferRadius: this.bufferRadius,
                setResultType: this.resultType,
                applySelectedTargetLayer: this.selectedTargetLayer.id
            };

            this.setSavedUrl(location.origin +
                location.pathname +
                "?isinitopen=" +
                this.id +
                "&initvalues=" +
                JSON.stringify(toolState));
        },
        copyUrl (evt) {
            Radio.trigger("Util", "copyToClipboard", evt.currentTarget);
        },
        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);
            // TODO replace trigger when ModelList is migrated
            // set the backbone model to active false in modellist for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.$store.state.Tools.BufferAnalysis.id);

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
                >{{ $t("modules.tools.bufferAnalysis.sourceSelectLabel") }}</label>
                <div class="col-md-7 col-sm-7 form-group form-group-sm">
                    <select
                        id="layer-analysis-select"
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
                        :disabled="!selectedSourceLayer || !bufferRadius || selectedTargetLayer"
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
                        @click="resetModule()"
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
                        @click="saveLayer()"
                    >
                        {{ $t("modules.tools.bufferAnalysis.saveBtn") }}
                    </button>
                </div>
                <input
                    id="layer-analysis-saved-url"
                    v-model="savedUrl"
                    class="col-md-12 col-sm-12 form-group form-group-sm"
                    readonly
                    :hidden="!savedUrl"
                    type="text"
                    @click="copyUrl"
                >
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    // @import "~variables";
</style>
