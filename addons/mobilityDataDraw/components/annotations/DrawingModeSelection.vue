<script>
import { mapGetters, mapActions } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";

export default {
    name: "DrawingModeSelection",
    components: {},
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants }
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
    </div>
</template>

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
</style>
