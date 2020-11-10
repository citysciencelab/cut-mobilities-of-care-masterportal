<script>
import {mapActions, mapGetters, mapMutations} from "vuex";
import getComponent from "../../../../utils/getComponent";
import Tool from "../../Tool.vue";
import * as constants from "../store/constantsDraw";
import DownloadView from "../../../../../modules/tools/download/view";

export default {
    name: "Draw",
    components: {
        Tool
    },
    data () {
        return {
            mapElement: document.getElementById("map"),
            storePath: this.$store.state.Tools.Draw,
            constants: constants,
            drawing: true
        };
    },
    computed: {
        ...mapGetters("Tools/Draw", constants.keyStore.getters),
        /**
         * Enables or disables all the select or input elements depending on if the currentInteraction is "draw".
         * @returns {Boolean} currentInteraction === "draw": return false and activate the HTML elements, else: return true and deactivate the HTML elements.
         */
        drawHTMLElements () {
            return !(this.currentInteraction === "draw");
        },
        /**
         * Enables or disables the select- or input-boxes depending on the state of currentInteraction and selectedFeature.
         * @returns {Boolean} false activates the elements, true deactivates the elements
         */
        drawHTMLElementsModifyFeature () {
            if (this.selectedFeature !== null && this.currentInteraction === "modify") {
                return false;
            }
            return !(this.currentInteraction === "draw");
        },
        /**
         * Disables the input for the diameter and the unit for the drawType "drawCircle" if the circleMethod is not set to "defined".
         * @returns {Boolean} return false if drawing is enabled and circleMethod is set to "defined", else return true.
         */
        drawCircleMethods () {
            return this.drawType.id === "drawCircle" ?
                this.drawHTMLElements || this.circleMethod !== "defined"
                : this.drawHTMLElements;
        }
        // NOTE: A nice feature would be that, similar to the interactions with the map, the Undo and Redo Buttons are disabled if not useable.
    },
    watch: {
        /**
          * Starts the action for processes, if the tool is be activated (active === true).
          * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
          * @returns {void}
         */
        active (value) {
            if (value) {
                new DownloadView(this.$store);
                this.setActive(value);
                this.setCanvasCursorByInteraction(this.currentInteraction);
            }
            else {
                this.resetModule();
                this.resetCanvasCursor();
            }
        }
    },
    mounted () {
        if (this.active) {
            this.setCanvasCursorByInteraction(this.currentInteraction);
        }
    },
    created () {
        const channel = Radio.channel("Draw");

        channel.reply({
            "getLayer": function () {
                return this.layer;
            },
            "downloadWithoutGUI": payload => this.downloadFeaturesWithoutGUI(payload)
        });
        channel.on({
            "initWithoutGUI": prmObject => this.initializeWithoutGUI(prmObject),
            "deleteAllFeatures": () => this.clearLayer(),
            "editWithoutGUI": () => this.editFeaturesWithoutGUI(),
            "cancelDrawWithoutGUI": () => this.cancelDrawWithoutGUI(),
            "downloadViaRemoteInterface": geomType => this.downloadViaRemoteInterface(geomType)
        });

        Radio.trigger("RemoteInterface", "postMessage", {"initDrawTool": true});
        this.$on("close", this.close);
    },
    methods: {
        ...mapMutations("Tools/Draw", constants.keyStore.mutations),
        ...mapActions("Tools/Draw", constants.keyStore.actions),
        /**
         * checks if both given arrays have the same number at their first 3 positions
         * note: the opacity (4th number) will be ignored - this is only about color
         * @param {Number[]} a a "color"-array e.g. white: [255, 255, 255, 1] or [255, 255, 255]
         * @param {Number[]} b another "color"-array to compare with
         * @returns {Boolean} true: the values at the first 3 positions of the given color arrays are identical
         */
        isEqualColorArrays (a, b) {
            if (Array.isArray(a) && Array.isArray(b) && a.length >= 3 && b.length >= 3) {
                return a[0] === b[0] && a[1] === b[1] && a[2] === b[2];
            }
            return false;
        },
        close () {
            this.resetModule();
            // The value "isActive" of the Backbone model is also set to false to change the CSS class in the menu (menu/desktop/tool/view.toggleIsActiveClass)
            const model = getComponent(this.storePath.id);

            if (model) {
                model.set("isActive", false);
            }
        },
        resetCanvasCursor () {
            this.mapElement.style.cursor = "";
            this.mapElement.onmousedown = undefined;
            this.mapElement.onmouseup = undefined;
        },
        setCanvasCursor (cursorType) {
            this.mapElement.style.cursor = cursorType;
            this.mapElement.onmousedown = this.onMouseDown;
            this.mapElement.onmouseup = this.onMouseUp;
        },
        setCanvasCursorByInteraction (interaction) {
            if (interaction === "modify" || interaction === "delete") {
                this.setCanvasCursor("pointer");
            }
            else {
                this.setCanvasCursor("crosshair");
            }
        },
        onMouseDown () {
            if (this.mapElement.style.cursor === "pointer") {
                this.mapElement.style.cursor = "grabbing";
            }
        },
        onMouseUp () {
            if (this.mapElement.style.cursor === "grabbing") {
                this.mapElement.style.cursor = "pointer";
            }
        },
        getIconLabelKey (option) {
            if (option.id) {
                if (this.$i18n.i18next.exists(option.id)) {
                    return option.id;
                }
                else if (this.$i18n.i18next.exists("common:modules.tools.draw.iconList." + option.id)) {
                    return "common:modules.tools.draw.iconList." + option.id;
                }
                else if (option.caption) {
                    return option.caption;
                }
                return option.id;
            }
            return "noName";
        },
        isColorSelected (option) {
            return this.color ? this.color.slice(0, this.color.length - 1).join(",") === option.value.join(",") : constants.pointColorOptions[0].color.join(",") === option.value.join(",");
        }
    }
};

</script>

<template lang="html">
    <Tool
        :title="name"
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
                    :value="option.geometry"
                    :selected="option.id === drawType.id"
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
                            v-model="circleInnerDiameter"
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
                            v-model="circleOuterDiameter"
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
                            v-model="text"
                            class="form-control"
                            type="text"
                            :placeholder="$t('common:modules.tools.draw.clickToPlaceText')"
                            :disabled="drawHTMLElementsModifyFeature"
                            :value="text"
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
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setFontSize"
                        >
                            <option
                                v-for="option in constants.fontSizeOptions"
                                :key="'draw-fontSize-' + option.value"
                                :selected="option.value === fontSize"
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
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setFont"
                        >
                            <option
                                v-for="option in constants.fontOptions"
                                :key="'draw-font-' + option.value"
                                :value="option.value"
                                :selected="option.value === font"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawSymbol'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.symbol") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-symbol"
                            class="form-control input-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setSymbol"
                        >
                            <!-- NOTE: caption of the iconList is deprecated in 3.0.0 -->
                            <option
                                v-for="option in iconList"
                                :key="'draw-icon-' + (option.id ? option.id : option.caption)"
                                :value="(option.id ? option.id : option.caption)"
                                :selected="option.id === symbol.id"
                            >
                                {{ $t(getIconLabelKey(option)) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawSymbol' && drawType.id !== 'writeText'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.lineWidth") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-strokeWidth"
                            class="form-control input-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setStrokeWidth"
                        >
                            <option
                                v-for="option in constants.strokeOptions"
                                :key="'draw-stroke-' + option.value"
                                :value="option.value"
                                :selected="option.value === strokeWidth"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawLine' && drawType.id !== 'drawCurve'&& drawType.id !== 'drawSymbol'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.transparency") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-opacity"
                            :key="`tool-draw-opacity-select`"
                            class="form-control input-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setOpacity"
                        >
                            <option
                                v-for="option in constants.transparencyOptions"
                                :key="'draw-opacity-option-' + option.value"
                                :selected="option.value === opacity"
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
                            :key="`tool-draw-opacityContour-select`"
                            class="form-control input-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setOpacityContour"
                        >
                            <option
                                v-for="option in constants.transparencyOptions.slice(0, constants.transparencyOptions.length -1)"
                                :key="'draw-opacityContour-option-' + option.value"
                                :selected="option.value === opacityContour"
                                :value="option.value"
                            >
                                {{ option.caption }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawSymbol' && drawType.id !== 'writeText'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.outlineColor") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-colorContour"
                            class="form-control input-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setColorContour"
                        >
                            <option
                                v-for="option in constants.colorContourOptions"
                                :key="'draw-colorContour-' + option.color"
                                :value="option.value"
                                :selected="isEqualColorArrays(option.value, colorContour)"
                            >
                                {{ $t("common:colors." + option.color) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id === 'drawSymbol' && symbol.id === 'iconPoint'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.color") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-pointColor"
                            class="form-control input-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setColor"
                        >
                            <option
                                v-for="option in constants.pointColorOptions"
                                :key="'draw-color-' + option.color"
                                :value="option.value"
                                :selected="isColorSelected(option)"
                            >
                                {{ $t("common:colors." + option.color) }}
                            </option>
                        </select>
                    </div>
                </div>
                <div
                    v-if="drawType.id !== 'drawLine' && drawType.id !== 'drawCurve' && drawType.id !== 'drawSymbol'"
                    class="form-group form-group-sm"
                >
                    <label class="col-md-5 col-sm-5 control-label">
                        {{ $t("common:modules.tools.draw.color") }}
                    </label>
                    <div class="col-md-7 col-sm-7">
                        <select
                            id="tool-draw-color"
                            class="form-control input-sm"
                            :disabled="drawHTMLElementsModifyFeature"
                            @change="setColor"
                        >
                            <option
                                v-for="option in constants.colorOptions"
                                :key="'draw-color-' + option.color"
                                :value="option.value"
                                :selected="isEqualColorArrays(option.value, color)"
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
                            @click="toggleInteraction('draw'); setCanvasCursorByInteraction('draw')"
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
                            @click="toggleInteraction('modify'); setCanvasCursorByInteraction('modify')"
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
                            @click="toggleInteraction('delete'); setCanvasCursorByInteraction('delete')"
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
