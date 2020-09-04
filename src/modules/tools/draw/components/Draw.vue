<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import Tool from "../../Tool.vue";
import * as constants from "../store/constantsDraw";

export default {
    name: "Draw",
    components: {
        Tool
    },
    data () {
        return {
            storePath: this.$store.state.Tools.Draw,
            constants: constants,
            drawing: true
        };
    },
    computed: {
        ...mapGetters("Tools/Draw", constants.keyStore.getters),
        /**
         * Enables or disables all the select or input elements depending on if the currentInteraction is "draw".
         *
         * @returns {Boolean} currentInteraction === "draw": return false and activate the HTML elements, else: return true and deactivate the HTML elements.
         */
        drawHTMLElements () {
            return !(this.currentInteraction === "draw");
        },
        /**
         * Disables the input for the diameter and the unit for the drawType "drawCircle" if the circleMethod is not set to "defined".
         *
         * @returns {Boolean} return false if drawing is enabled and circleMethod is set to "defined", else return true.
         */
        drawCircleMethods () {
            return this.drawType.id === "drawCircle" ?
                this.drawHTMLElements || this.circleMethod !== "defined"
                : this.drawHTMLElements;
        }
        // NOTE: A nice feature would be that, similar to the interactions with the map, the Undo and Redo Buttons are disabled if not useable.
    },
    created () {
        this.$on("close", this.close);
        this.setActive(this.active);
        this.activateByUrlParam();
    },
    methods: {
        ...mapMutations("Tools/Draw", constants.keyStore.mutations),
        ...mapActions("Tools/Draw", constants.keyStore.actions),
        close () {
            // NOTE: Line 50 can be moved to Line 41 when everything is completly in Vue
            this.resetModule();
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = Radio.request("ModelList", "getModelByAttributes", {id: this.storePath.id});

            if (model) {
                model.set("isActive", false);
            }
        }
    }
};

</script>

<template lang="html">
    <Tool
        :title="$t('common:modules.tools.draw.title')"
        :icon="glyphicon"
        :active="active && !withoutGUI"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
    >
        <template v-slot:toolBody>
            <select
                id="tool-draw-drawType"
                class="form-control input-sm"
                :disabled="drawHTMLElements"
                @change="setDrawType"
            >
                <option
                    v-for="option in constants.drawTypeOptions"
                    :id="option.id"
                    :key="'draw-drawType-' + option.id"
                    :value="option.value"
                >
                    {{ $t("common:modules.tools.draw." + option.id) }}
                </option>
            </select>
            <hr>
            <form
                class="form-horizontal"
                role="form"
            >
                <div
                    v-if="drawType.id === 'drawCircle'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.method") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-circleMethod"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setCircleMethod"
                        >
                            <option value="interactive">
                                {{ $t("common:modules.tools.draw.interactive") }}
                            </option>
                            <option value="defined">
                                {{ $t("common:modules.tools.draw.defined") }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawCircle' || drawType.id === 'drawDoubleCircle'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.diameter") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <input
                            id="tool-draw-circleInnerDiameter"
                            class="form-control"
                            :style="{borderColor: innerBorderColor}"
                            type="number"
                            :placeholder="$t('common:modules.tools.draw.doubleCirclePlaceholder')"
                            :disabled="drawCircleMethods"
                            @input="setCircleInnerDiameter"
                        />
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawDoubleCircle'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.outerDiameter") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <input
                            id="tool-draw-circleOuterDiameter"
                            class="form-control"
                            :style="{borderColor: outerBorderColor}"
                            type="number"
                            :placeholder="$t('common:modules.tools.draw.doubleCirclePlaceholder')"
                            :disabled="drawHTMLElements"
                            @input="setCircleOuterDiameter"
                        >
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawCircle' || drawType.id === 'drawDoubleCircle'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.unit") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-circleUnit"
                            class="form-control input-sm"
                            :disabled="drawCircleMethods"
                            @change="setUnit"
                        >
                            <option
                                value="m"
                                label="m"
                            />
                            <option
                                value="km"
                                label="km"
                            />
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'writeText'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.text") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <input
                            id="tool-draw-text"
                            class="form-control"
                            type="text"
                            :placeholder="$t('common:modules.tools.draw.clickToPlaceText')"
                            :disabled="drawHTMLElements"
                            @input="setText"
                        >
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'writeText'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.fontSize") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-fontSize"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setFontSize"
                        >
                            <option
                                v-for="option in constants.fontSizeOptions"
                                :key="'draw-fontSize-' + option.value"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'writeText'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.fontName") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-font"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setFont"
                        >
                            <option
                                v-for="option in constants.fontOptions"
                                :key="'draw-font-' + option.value"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawPoint'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.symbol") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-symbol"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setSymbol"
                        >
                            <!-- NOTE: caption of the iconList is deprecated in 3.0.0 -->
                            <option
                                v-for="option in iconList"
                                :key="'draw-icon-' + (option.id ? option.id : option.caption)"
                                :value="(option.id ? option.id : option.caption)"
                            >
                                {{ $t(option.id ? "common:modules.tools.draw.iconList." + option.id : option.caption) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawPoint'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.size") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-pointSize"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setPointSize"
                        >
                            <option
                                v-for="option in constants.pointSizeOptions"
                                :key="'draw-pointSize-' + option.value"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawPoint' && drawType.id !== 'writeText'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.lineWidth") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-strokeWidth"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setStrokeWidth"
                        >
                            <option
                                v-for="option in constants.strokeOptions"
                                :key="'draw-stroke-' + option.value"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawLine' && drawType.id !== 'drawCurve'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.transparency") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-opacity"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setOpacity"
                        >
                            <option
                                v-for="option in constants.transparencyOptions"
                                :key="'draw-opacity-' + option.value"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawLine' || drawType.id === 'drawCurve'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.transparencyOutline") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-opacityContour"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setOpacityContour"
                        >
                            <option
                                v-for="option in constants.transparencyOptions.slice(0, constants.transparencyOptions.length -1)"
                                :key="'draw-opacityContour-' + option.value"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawPoint' && drawType.id !== 'writeText'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.outlineColor") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-colorContour"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setColorContour"
                        >
                            <option
                                v-for="option in constants.colorContourOptions"
                                :key="'draw-colorContour-' + option.color"
                                :value="option.value"
                            >
                                {{ $t("common:colors." + option.color) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawLine' && drawType.id !== 'drawCurve'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.color") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-color"
                            class="form-control input-sm"
                            :disabled="drawHTMLElements"
                            @change="setColor"
                        >
                            <option
                                v-for="option in constants.colorOptions"
                                :key="'draw-color-' + option.color"
                                :value="option.value"
                            >
                                {{ $t("common:colors." + option.color) }}
                            </option>
                        </select>
                    </div>
                </div>
            </form>
            <hr>
            <div
                class="form-horizontal"
                role="form"
            >
                <div class="form-group form-group-sm">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                        <button
                            id="tool-draw-drawInteraction"
                            class="btn btn-sm btn-block"
                            :class="currentInteraction === 'draw' ? 'btn-primary' : 'btn-lgv-grey'"
                            :disabled="currentInteraction === 'draw'"
                            @click="toggleInteraction('draw')"
                        >
                            <span class="glyphicon glyphicon-pencil" />
                            {{ $t("common:modules.tools.draw.button.draw") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                        <button
                            id="tool-draw-undoInteraction"
                            class="btn btn-sm btn-block btn-lgv-grey"
                            @click="undoLastStep"
                        >
                            <span class="glyphicon glyphicon-repeat" />
                            {{ $t("common:modules.tools.draw.button.undo") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                        <button
                            id="tool-draw-redoInteraction"
                            class="btn btn-sm btn-block btn-lgv-grey"
                            @click="redoLastStep"
                        >
                            <span class="glyphicon glyphicon-repeat" />
                            {{ $t("common:modules.tools.draw.button.redo") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                        <button
                            id="tool-draw-editInteraction"
                            class="btn btn-sm btn-block"
                            :class="currentInteraction === 'modify' ? 'btn-primary' : 'btn-lgv-grey'"
                            :disabled="currentInteraction === 'modify'"
                            @click="toggleInteraction('modify')"
                        >
                            <span class="glyphicon glyphicon-wrench" />
                            {{ $t("common:modules.tools.draw.button.edit") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                        <button
                            id="tool-draw-downloadInteraction"
                            class="btn btn-sm btn-block btn-lgv-grey"
                            @click="startDownloadTool"
                        >
                            <span class="glyphicon glyphicon-floppy-disk" />
                            {{ $t("common:button.download") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                        <button
                            id="tool-draw-deleteInteraction"
                            class="btn btn-sm btn-block"
                            :class="currentInteraction === 'delete' ? 'btn-primary' : 'btn-lgv-grey'"
                            :disabled="currentInteraction === 'delete'"
                            @click="toggleInteraction('delete')"
                        >
                            <span class="glyphicon glyphicon-trash" />
                            {{ $t("common:modules.tools.draw.button.delete") }}
                        </button>
                    </div>
                </div>
                <div class="form-group form-group-sm">
                    <div class="col-md-12 col-sm-12 col-xs-12">
                        <button
                            id="tool-draw-deleteAllInteraction"
                            class="btn btn-sm btn-block btn-lgv-grey"
                            @click="clearLayer"
                        >
                            <span class="glyphicon glyphicon-trash" />
                            {{ $t("common:modules.tools.draw.button.deleteAll") }}
                        </button>
                    </div>
                </div>
            </div>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
    @import "~variables";
    .no-cursor {
        cursor: none;
    }
    .cursor-crosshair {
        cursor: crosshair;
    }
</style>
