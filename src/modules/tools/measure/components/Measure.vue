<script>
import {mapGetters, mapActions, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import Tool from "../../Tool.vue";
import getters from "../store/gettersMeasure";
import mutations from "../store/mutationsMeasure";
import actions from "../store/actionsMeasure";

/**
 * Measurement tool to measure lines and areas in the map.
 */
export default {
    name: "Measure",
    components: {
        Tool
    },
    computed: {
        ...mapGetters("Tools/Measure", Object.keys(getters)),
        ...mapGetters(["isTableStyle", "isDefaultStyle"]),
        ...mapGetters("Map", ["layerById", "map", "is3d"])
    },
    watch: {
        /**
         * (Re-)Creates or removes draw interaction on opening/closing tool.
         * @param {boolean} value active state of tool
         * @returns {void}
         */
        active (value) {
            (value ? this.createDrawInteraction : this.removeDrawInteraction)();
        },
        /**
         * Recreates draw interaction on geometry type update.
         * @returns {void}
         */
        selectedGeometry () {
            this.createDrawInteraction();
        }
    },
    created () {
        this.$on("close", this.close);
        this.addLayerToMap(this.layer);
    },
    mounted () {
        if (this.active) {
            this.createDrawInteraction();
        }
    },
    methods: {
        ...mapMutations("Tools/Measure", Object.keys(mutations)),
        ...mapActions("Tools/Measure", Object.keys(actions)),
        ...mapMutations("Map", ["addLayerToMap"]),
        /**
         * Sets active to false.
         * @returns {void}
         */
        close () {
            this.setActive(false);
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
    >
        <template v-slot:toolBody>
            <div
                v-if="active"
                id="measure"
            >
                <form
                    class="form-horizontal"
                    role="form"
                >
                    <div class="form-group form-group-sm">
                        <label
                            for="measure-tool-geometry-select"
                            class="col-md-5 col-sm-5 control-label"
                        >
                            {{ $t("modules.tools.measure.geometry") }}
                        </label>
                        <div class="col-md-7 col-sm-7">
                            <select
                                id="measure-tool-geometry-select"
                                class="font-arial form-control input-sm pull-left"
                                :disabled="is3d"
                                :value="selectedGeometry"
                                @change="setSelectedGeometry($event.target.value)"
                            >
                                <option
                                    v-for="geometryValue in geometryValues"
                                    :key="'measure-tool-geometry-select-' + geometryValue"
                                    :value="geometryValue"
                                >
                                    {{ is3d
                                        ? selectedGeometry
                                        : $t("modules.tools.measure." +
                                            (geometryValue === "LineString" ? "stretch" : "area"))
                                    }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <label
                            for="measure-tool-unit-select"
                            class="col-md-5 col-sm-5 control-label"
                        >
                            {{ $t("modules.tools.measure.measure") }}
                        </label>
                        <div class="col-md-7 col-sm-7">
                            <select
                                id="measure-tool-unit-select"
                                class="font-arial form-control input-sm pull-left"
                                :value="selectedUnit"
                                @change="setSelectedUnit($event.target.value)"
                            >
                                <option
                                    v-for="(unit, i) in currentUnits"
                                    :key="'measure-tool-unit-select-' + i"
                                    :value="i"
                                >
                                    {{ unit }}
                                </option>
                            </select>
                        </div>
                    </div>
                    <div
                        v-if="isDefaultStyle"
                        class="form-group form-group-sm"
                    >
                        <div class="col-md-12 col-sm-12 inaccuracy-list">
                            {{ $t("modules.tools.measure.influenceFactors") }}
                            <ul>
                                <li>{{ $t("modules.tools.measure.scale") }}</li>
                                <li>{{ $t("modules.tools.measure.resolution") }}</li>
                                <li>{{ $t("modules.tools.measure.screenResolution") }}</li>
                                <li>{{ $t("modules.tools.measure.inputAccuracy") }}</li>
                                <li>{{ $t("modules.tools.measure.measureDistance") }}</li>
                            </ul>
                        </div>
                    </div>
                    <div class="form-group form-group-sm">
                        <div class="col-md-12 col-sm-12">
                            <button
                                id="measure-delete"
                                type="button"
                                class="btn btn-lgv-grey col-md-12 col-sm-12"
                                @click="deleteFeatures"
                            >
                                {{ $t('modules.tools.measure.deleteMeasurements') }}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
@import "~variables";

.inaccuracy-list {
    max-width: 270px;
}
</style>
