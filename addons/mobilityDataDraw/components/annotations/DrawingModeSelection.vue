<script>
import { mapGetters, mapActions } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";

export default {
    name: "DrawingModeSelection",
    components: {},
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants },
            showDialog: false,
        };
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters))
    },
    methods: {
        ...mapActions("Tools/MobilityDataDraw", ["setDrawingMode"])
    }
};
</script>

<template lang="html">
    <div>
        <template v-for="mode in constants.drawingModes">
            <input
                type="radio"
                name="tool-mobilityDataDraw-drawingMode"
                class="drawing-mode-input"
                :id="'tool-mobilityDataDraw-drawingMode-' + mode"
                :value="mode"
                :checked="mode === drawingMode"
                :disabled="
                    currentInteraction === constants.interactionTypes.MODIFY
                "
                @change="setDrawingMode"
            />
            <label
                class="btn btn-lgv-grey drawing-mode-label"
                v-bind:class="{ active: mode === drawingMode }"
                :for="'tool-mobilityDataDraw-drawingMode-' + mode"
                :key="'tool-mobilityDataDraw-drawingMode-' + mode"
                :title="$t('additional:modules.tools.drawingMode.' + mode)"
            >
                <v-icon>
                    {{ constants.drawingModeIcons[mode] }}
                </v-icon>
            </label>
        </template>

        <v-icon
            class="btn btn-lgv-grey drawing-mode-label info-button"
            @click="showDialog = true;"
        >
            help_outline
        </v-icon>

        <v-dialog
            v-model="showDialog"
            transition="dialog-top-transition"
            max-width="600"
            v-bind:scrollable="true"
        >
            <v-card>
                <v-card-title class="text-h5 grey lighten-2">
                    {{ $t(
                        "additional:modules.tools.mobilityDataDraw.help.title"
                    ) }}
                </v-card-title>

                <v-card-text class="anotations-help-text">
                    <h4>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.help.point"
                        ) }}
                    </h4>
                    <div>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.annotations.pointDrawingHint"
                        ) }}
                    </div>
                    <h4>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.help.line"
                        ) }}
                    </h4>
                    <div>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.annotations.routeDrawingHint"
                        ) }}
                    </div>
                    <h4>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.help.area"
                        ) }}
                    </h4>
                    <div>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.annotations.areaDrawingHint"
                        ) }}
                    </div>
                    <h4>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.help.delete"
                        ) }}
                    </h4>
                    <div>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.help.deleteText"
                        ) }}
                    </div>
                    <img src="../../assets/images/delete.jpg">
                    <h4>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.help.edit"
                        ) }}
                    </h4>
                    <div>
                        {{ $t(
                            "additional:modules.tools.mobilityDataDraw.help.editText"
                        ) }}
                    </div>
                    <img src="../../assets/images/edit-1.jpg">
                    <img src="../../assets/images/edit-2.jpg">
                </v-card-text>

                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn
                        color="primary"
                        text
                        @click="showDialog = false"
                    >
                        OK
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </div>
</template>

<style lang="less">
.anotations-help-text {
    h4 {
        border-bottom: none !important;
        font-weight: bold;
    }
    img {
        max-width: 410px;
        margin: 3px 0;
    }
}
</style>

<style lang="less" scoped>
@import "~variables";

.drawing-mode-input {
    display: none;

    &[disabled] {
        & + .drawing-mode-label {
            color: #969696;
            pointer-events: none;
        }
    }

    &:not([disabled]) {
        & + .drawing-mode-label.active {
            color: #66afe9;
            background-color: rgba(102, 175, 233, 0.2);
        }
    }
}

.drawing-mode-label {
    display: inline-flex;
    height: 40px;
    width: 40px;
    font-size: @icon_length_small;
    margin: 0;
    padding: 8px;
    border-radius: 12px;

    &:not(:last-child) {
        margin-right: 5px;
    }

    &::v-deep .v-icon {
        color: currentColor;
    }
}

.info-button {
    float: right;
    background-color: transparent;
}

</style>
