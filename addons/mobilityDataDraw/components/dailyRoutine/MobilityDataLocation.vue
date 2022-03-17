<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import MobilityDataForm from "./MobilityDataForm.vue";
import MobilityDataActions from "./MobilityDataActions.vue";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "MobilityDataLocation",
    components: {
        MobilityDataForm,
        MobilityDataActions
    },
    props: {
        // The map feature of the mobility data location
        feature: {
            type: Object,
            default: null
        },
        // The geometry index of the mobility data location
        geometryIndex: {
            type: Number,
            default: null
        },
        // The title of the mobility data location
        locationTitle: {
            type: String,
            default: ""
        },
        // The start time of the mobility data location
        startTime: {
            type: String,
            default: ""
        },
        // The end time of the mobility data location
        endTime: {
            type: String,
            default: ""
        },
        // The comment to the mobility data location
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
         * Whether this mobility data location is disabled or not.
         */
        locationIsDisabled: function() {
            return (
                this.currentInteraction ===
                    this.constants.interactionTypes.MODIFY &&
                !this.feature.get("isSelected")
            );
        },

        /**
         * Whether this mobility data location is readonly or not.
         */
        locationIsReadonly: function() {
            return (
                this.currentInteraction ===
                    this.constants.interactionTypes.MODIFY &&
                this.feature.get("isSelected")
            );
        },

        /**
         * Whether the marker for the mobility data location was placed on the map or not.
         */
        markerWasPlaced: function() {
            return Boolean(this.feature.getGeometry());
        }
    },
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", Object.keys(mutations)),
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions)),

        /**
         * Selects the feature of the opened mobility data location
         * @param {Event}  event   The event fired by toggling a mobility data location panel
         * @returns {void}
         */
        onClickMobilityDataLocation(event) {
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
         * Sets the title for the opened mobility data location
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
        class="mobility-data-location"
        :disabled="locationIsDisabled"
        :readonly="locationIsReadonly"
        @click="onClickMobilityDataLocation"
    >
        <v-expansion-panel-header disable-icon-rotate>
            <template v-slot:actions>
                <v-icon dense :title="comment">
                    {{ comment ? "comment" : "" }}
                </v-icon>
            </template>

            <div class="mobility-data-location-header">
                <v-icon class="mobility-data-location-icon">
                    {{
                        constants.mobilityModeIcons[constants.mobilityModes.POI]
                    }}
                </v-icon>

                <input
                    class="mobility-data-location-title"
                    :placeholder="
                        $t(
                            'additional:modules.tools.mobilityDataDraw.label.location'
                        )
                    "
                    :value="locationTitle"
                    @change="onSetTitle"
                    @click.stop
                />

                <span v-if="startTime || endTime">
                    {{ startTime || "?" }} – {{ endTime || "?" }}
                </span>
            </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <div class="mobility-data-location-content">
                <p v-if="!markerWasPlaced" class="mobility-data-location-hint">
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.dailyRoutine.addLocationMarker"
                        )
                    }}
                </p>

                <template v-else>
                    <MobilityDataForm
                        :geometryIndex="geometryIndex"
                        :startTime="startTime"
                        :endTime="endTime"
                        :comment="comment"
                        :showCostInput="false"
                    />

                    <MobilityDataActions
                        :geometryIndex="geometryIndex"
                        type="location"
                    />
                </template>
            </div>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<style lang="less" scoped>
.mobility-data-location {
    border-left: 4px solid transparent;

    &.v-expansion-panel {
        background: none;

        &::before,
        &::after {
            display: none;
        }
    }

    &:not(.v-expansion-panel--disabled) {
        .mobility-data-location-icon {
            color: var(--mobility-mode-poi-color-hex);
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
        margin-left: 0.1875rem;
        margin-right: auto;
        border-radius: 50%;
        background-color: var(--mobility-data-draw-background-color-hex);
        color: currentColor;
    }

    &-title {
        margin: -5px 0;
        padding: 5px 0;
        text-overflow: ellipsis;
    }

    &-content {
        padding-left: 3.3215rem;
    }

    &-hint {
        margin: 4px 0;
    }
}
</style>
