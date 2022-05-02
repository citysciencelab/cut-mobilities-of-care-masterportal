<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import ScrollContainerWithShadows from "../ScrollContainerWithShadows.vue";
import MobilityDataSegment from "./MobilityDataSegment.vue";
import MobilityDataLocation from "./MobilityDataLocation.vue";
import MobilityModeSelection from "./MobilityModeSelection.vue";
import WeekdaySelection from "./WeekdaySelection.vue";
import AudioRecorderWrapper from "../AudioRecorderWrapper.vue";
import ImageUploader from "../ImageUploader.vue";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "DailyRoutineView",
    components: {
        ScrollContainerWithShadows,
        MobilityDataSegment,
        MobilityDataLocation,
        MobilityModeSelection,
        WeekdaySelection,
        AudioRecorderWrapper,
        ImageUploader
    },
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants }
        };
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters)),

        /**
         * The geometry index of the selected feature.
         */
        selectedFeatureGeometryIndex: function() {
            const data = this.mobilityData.find(({ feature }) =>
                feature.get("isSelected")
            );
            return data && data.geometryIndex;
        }
    },
    mounted() {
        this.initializeDailyRoutineView();
    },
    destroyed() {
        this.cleanUpDailyRoutineView();
    },
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", Object.keys(mutations)),
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions)),

        /**
         * Returns whether the location button should be rendered or not
         * @param {number} index the index of the current mobility data element
         * @returns {Boolean}
         */
        getShowLocationButton: function(index) {
            const previousElement = this.mobilityData[index - 1];
            const currentElement = this.mobilityData[index];

            return (
                (!previousElement ||
                    previousElement.mobilityMode !==
                        this.constants.mobilityModes.POI) &&
                (!currentElement ||
                    currentElement.mobilityMode !==
                        this.constants.mobilityModes.POI)
            );
        }
    }
};
</script>

<template lang="html">
    <div id="tool-mobilityDataDraw-view-dailyRoutine">
        <section
            id="tool-mobilityDataDraw-view-dailyRoutine-section-mobilityMode"
        >
            <h4>
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.label.mobilityMode"
                    )
                }}
            </h4>

            <MobilityModeSelection />
        </section>

        <section id="tool-mobilityDataDraw-view-dailyRoutine-section-weekday">
            <h4>
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.label.weekdays"
                    )
                }}
            </h4>

            <WeekdaySelection />
        </section>

        <section
            id="tool-mobilityDataDraw-view-dailyRoutine-section-mobilityData"
        >
            <h4>
                {{
                    $t("additional:modules.tools.mobilityDataDraw.label.routes")
                }}
            </h4>

            <template v-if="!mobilityData.length">
                <p>
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.dailyRoutine.introduction"
                        )
                    }}
                </p>
                <p>
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.dailyRoutine.drawingHint"
                        )
                    }}
                </p>
            </template>

            <ScrollContainerWithShadows v-else>
                <v-expansion-panels
                    class="mobility-data-routes"
                    :value="selectedFeatureGeometryIndex"
                >
                    <template v-for="(_, index) in mobilityData.length + 1">
                        <v-btn
                            v-if="getShowLocationButton(index)"
                            :key="'mobility-data-location-button-' + index"
                            class="mobility-data-location-button"
                            :disabled="
                                currentInteraction ===
                                    constants.interactionTypes.MODIFY
                            "
                            @click="addLocationToMobilityData(index)"
                            icon
                        >
                            <v-icon>add_circle</v-icon>
                        </v-btn>

                        <MobilityDataLocation
                            v-if="
                                mobilityData[index] &&
                                    mobilityData[index].mobilityMode ===
                                        constants.mobilityModes.POI
                            "
                            :key="mobilityData[index].geometryIndex"
                            :feature="mobilityData[index].feature"
                            :geometry-index="mobilityData[index].geometryIndex"
                            :location-title="mobilityData[index].title"
                            :startTime="mobilityData[index].startTime"
                            :endTime="mobilityData[index].endTime"
                            :comment="mobilityData[index].comment"
                        />

                        <MobilityDataSegment
                            v-else-if="mobilityData[index]"
                            :key="mobilityData[index].geometryIndex"
                            :feature="mobilityData[index].feature"
                            :geometry-index="mobilityData[index].geometryIndex"
                            :segment-mobility-mode="
                                mobilityData[index].mobilityMode
                            "
                            :segment-title="mobilityData[index].title"
                            :startTime="mobilityData[index].startTime"
                            :endTime="mobilityData[index].endTime"
                            :cost="mobilityData[index].cost"
                            :comment="mobilityData[index].comment"
                        />
                    </template>
                </v-expansion-panels>
            </ScrollContainerWithShadows>
        </section>

        <section
            v-if="mobilityData.length"
            id="tool-mobilityDataDraw-view-dailyRoutine-section-summary"
        >
            <textarea
                class="form-control"
                :placeholder="
                    $t(
                        'additional:modules.tools.mobilityDataDraw.label.summary'
                    )
                "
                :value="summary"
                :disabled="
                    currentInteraction === constants.interactionTypes.MODIFY
                "
                @change="setSummary"
            />
            <AudioRecorderWrapper />
            <ImageUploader />
        </section>
    </div>
</template>

<style lang="less" scoped>
#tool-mobilityDataDraw-view-dailyRoutine {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
}

#tool-mobilityDataDraw-view-dailyRoutine-section-mobilityData {
    flex-grow: 1;
    min-height: 0;

    > div {
        max-height: calc(100% - 39px);
    }
}

.mobility-data-routes {
    justify-content: flex-start;
    width: calc(100% - 4px);
    margin: 0 2px;

    &::before {
        content: "";
        z-index: -1;
        position: absolute;
        top: 24px;
        left: 42px;
        width: 2px;
        height: calc(100% - 48px);
        background: #acacac;
    }
}

.mobility-data-location-button {
    margin: 8px 25px;
    padding: 2px;
    border-radius: 50%;
    background-color: var(--mobility-data-draw-background-color-hex);
    color: #757575;

    &[disabled] {
        color: #969696;
        opacity: 1;
    }

    &:hover,
    &:focus-visible {
        color: #333;
    }

    &::v-deep .v-icon {
        color: currentColor;
    }
}

.v-expansion-panel--active + .mobility-data-location-button {
    margin-top: 24px;
}

</style>
