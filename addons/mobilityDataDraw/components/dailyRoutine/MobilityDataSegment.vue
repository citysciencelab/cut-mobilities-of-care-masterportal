<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import MobilityDataForm from "./MobilityDataForm.vue";
import MobilityDataActions from "./MobilityDataActions.vue";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "MobilityDataSegment",
    components: {
        MobilityDataForm,
        MobilityDataActions
    },
    props: {
        // The map feature of the mobility data segment
        feature: {
            type: Object,
            default: null
        },
        // The geometry index of the mobility data segment
        geometryIndex: {
            type: Number,
            default: null
        },
        // The mobility mode of the mobility data segment
        segmentMobilityMode: {
            type: String,
            default: null
        },
        // The title of the mobility data segment
        segmentTitle: {
            type: String,
            default: ""
        },
        // The start time of the mobility data segment
        startTime: {
            type: String,
            default: ""
        },
        // The end time of the mobility data segment
        endTime: {
            type: String,
            default: ""
        },
        // The cost of the mobility data segment
        cost: {
            type: Number,
            default: 0.0
        },
        // The comment to the mobility data segment
        comment: {
            type: String,
            default: ""
        }
    },
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants }
        };
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters)),

        /**
         * Whether this mobility data segment is disabled or not.
         */
        segmentIsDisabled: function() {
            return (
                this.currentInteraction ===
                    this.constants.interactionTypes.MODIFY &&
                !this.feature.get("isSelected")
            );
        },

        /**
         * Whether this mobility data segment is readonly or not.
         */
        segmentIsReadonly: function() {
            return (
                this.currentInteraction ===
                    this.constants.interactionTypes.MODIFY &&
                this.feature.get("isSelected")
            );
        }
    },
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", Object.keys(mutations)),
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions)),

        /**
         * Selects the feature of the opened mobility data segment
         * @param {Event}  event   The event fired by toggling a mobility data segment panel
         * @returns {void}
         */
        onClickMobilityDataSegment(event) {
            // Ignore when in modifying mode
            if (
                this.currentInteraction ===
                this.constants.interactionTypes.MODIFY
            ) {
                return;
            }

            const routeElement = event.currentTarget;
            const isSelected = !routeElement.classList.contains(
                "v-expansion-panel-header--active"
            );
            const selectedIndex = isSelected ? this.geometryIndex : null;

            this.selectMobilityDataFeature(selectedIndex);
        },

        /**
         * Sets the mobility mode for the opened mobility data segment
         * @param {String}  newMobilityMode   The selected mobility mode
         * @returns {void}
         */
        onSetMobilityMode(newMobilityMode) {
            this.setMobilityDataProperties({
                geometryIndex: this.geometryIndex,
                feature: this.feature,
                mobilityMode: newMobilityMode
            });
        },

        /**
         * Sets the title for the opened mobility data segment
         * @param {Event}   event   The event fired by changing the title input
         * @returns {void}
         */
        onSetTitle(event) {
            const title = event.target.value;
            this.setMobilityDataProperties({
                geometryIndex: this.geometryIndex,
                title
            });
        }
    }
};
</script>

<template lang="html" v-if="feature">
    <v-expansion-panel
        class="mobility-data-segment"
        v-bind:class="['mobility-mode-' + segmentMobilityMode]"
        :disabled="segmentIsDisabled"
        :readonly="segmentIsReadonly"
        @click="onClickMobilityDataSegment"
    >
        <v-expansion-panel-header disable-icon-rotate>
            <template v-slot:actions>
                <v-icon dense :title="comment">
                    {{ comment ? "comment" : "" }}
                </v-icon>
            </template>

            <div class="mobility-data-segment-header">
                <v-select
                    v-if="segmentIsReadonly"
                    :value="segmentMobilityMode"
                    :items="Object.values(constants.routeMobilityModes)"
                    @change="onSetMobilityMode"
                    class="mobility-data-segment-select"
                    attach
                    dense
                    solo
                >
                    <template v-slot:selection="{ item }">
                        <v-icon dense>
                            {{ constants.mobilityModeIcons[item] }}
                        </v-icon>
                    </template>
                    <template v-slot:item="{ item }">
                        <v-icon dense>
                            {{ constants.mobilityModeIcons[item] }}
                        </v-icon>
                    </template>
                </v-select>

                <v-icon v-else class="mobility-data-segment-icon" dense>
                    {{ constants.mobilityModeIcons[segmentMobilityMode] }}
                </v-icon>

                <input
                    class="mobility-data-segment-title"
                    :placeholder="
                        $t(
                            'additional:modules.tools.mobilityDataDraw.label.route'
                        )
                    "
                    :value="segmentTitle"
                    @change="onSetTitle"
                    @click.stop
                />

                <span v-if="startTime || endTime">
                    {{ startTime || "?" }} – {{ endTime || "?" }}
                </span>
            </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <div class="mobility-data-segment-content">
                <MobilityDataForm
                    :geometryIndex="geometryIndex"
                    :startTime="startTime"
                    :endTime="endTime"
                    :cost="cost"
                    :comment="comment"
                />

                <MobilityDataActions
                    :geometryIndex="geometryIndex"
                    type="route"
                />
            </div>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<style lang="less" scoped>
.mobility-data-segment {
    border-left: 4px solid #e3e3e3;
    border-left: 4px solid currentColor;

    &.v-expansion-panel--disabled {
        background-color: #f2f2f2;

        .mobility-data-segment-icon {
            color: currentColor;
        }
    }

    &:not(.v-expansion-panel--disabled) {
        &.mobility-mode-car {
            border-color: var(--mobility-mode-car-color-hex);
        }
        &.mobility-mode-bicycle {
            border-color: var(--mobility-mode-bicycle-color-hex);
        }
        &.mobility-mode-bus {
            border-color: var(--mobility-mode-bus-color-hex);
        }
        &.mobility-mode-train {
            border-color: var(--mobility-mode-train-color-hex);
        }
        &.mobility-mode-walk {
            border-color: var(--mobility-mode-walk-color-hex);
        }
    }

    &-header {
        display: grid;
        grid-template-columns: 3rem auto 7rem;
        grid-gap: 0.3125rem;
        align-items: center;
        max-width: calc(100% - 20px);
    }

    &-icon {
        margin-left: 0.3125rem;
        margin-right: auto;
    }

    &-select {
        position: absolute;
        width: 3rem;

        &::v-deep {
            &.v-text-field.v-text-field--enclosed:not(.v-text-field--rounded)
                > .v-input__control
                > .v-input__slot {
                margin: 0;
                padding: 0 0 0 0.3125rem;
            }

            .v-text-field__details {
                display: none;
            }
        }
    }

    &-title {
        grid-column: 2;
        margin: -5px 0;
        padding: 5px 0;
        text-overflow: ellipsis;
    }

    &-content  {
        padding-left: 3.3215rem;
    }
}
</style>
