<script>
import { mapGetters, mapActions } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";

export default {
    name: "MobilityModeSelection",
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
        ...mapActions("Tools/MobilityDataDraw", ["setMobilityMode"])
    }
};
</script>

<template lang="html">
    <div>
        <template v-for="mode in constants.routeMobilityModes">
            <input
                type="radio"
                name="tool-mobilityDataDraw-mobilityMode"
                class="mobility-mode-input"
                :id="'tool-mobilityDataDraw-mobilityMode-' + mode"
                :value="mode"
                :checked="mode === mobilityMode"
                :disabled="
                    currentInteraction === constants.interactionTypes.MODIFY
                "
                @change="setMobilityMode"
            />
            <label
                class="btn btn-lgv-grey mobility-mode-label"
                v-bind:class="[
                    { active: mode === mobilityMode },
                    'mobility-mode-' + mode
                ]"
                :for="'tool-mobilityDataDraw-mobilityMode-' + mode"
                :key="'tool-mobilityDataDraw-mobilityMode-' + mode"
                :title="$t('additional:modules.tools.mobilityMode.' + mode)"
            >
                <v-icon>
                    {{ constants.mobilityModeIcons[mode] }}
                </v-icon>
            </label>
        </template>
    </div>
</template>

<style lang="less" scoped>
@import "~variables";

.mobility-mode-input {
    display: none;

    &[disabled] {
        & + .mobility-mode-label {
            color: #969696;
            pointer-events: none;
        }
    }

    &:not([disabled]) {
        & + .mobility-mode-label.active {
            &.mobility-mode-car {
                color: var(--mobility-mode-car-color-hex);
                background-color: rgba(var(--mobility-mode-car-color-rgb), 0.2);
            }
            &.mobility-mode-bicycle {
                color: var(--mobility-mode-bicycle-color-hex);
                background-color: rgba(
                    var(--mobility-mode-bicycle-color-rgb),
                    0.2
                );
            }
            &.mobility-mode-bus {
                color: var(--mobility-mode-bus-color-hex);
                background-color: rgba(var(--mobility-mode-bus-color-rgb), 0.2);
            }
            &.mobility-mode-train {
                color: var(--mobility-mode-train-color-hex);
                background-color: rgba(
                    var(--mobility-mode-train-color-rgb),
                    0.2
                );
            }
            &.mobility-mode-walk {
                color: var(--mobility-mode-walk-color-hex);
                background-color: rgba(
                    var(--mobility-mode-walk-color-rgb),
                    0.2
                );
            }
        }
    }
}

.mobility-mode-label {
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
