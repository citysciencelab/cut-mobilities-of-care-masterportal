<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import ScrollContainerWithShadows from "../ScrollContainerWithShadows.vue";
import DrawingModeSelection from "./DrawingModeSelection.vue";
import AnnotationPanel from "./AnnotationPanel.vue";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "AnnotationsView",
    components: {
        ScrollContainerWithShadows,
        DrawingModeSelection,
        AnnotationPanel
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
            const data = this.annotations.find(({ feature }) =>
                feature.get("isSelected")
            );
            return data && data.geometryIndex;
        }
    },
    mounted() {
        this.initializeAnnotationsView();
    },
    destroyed() {
        this.cleanUpAnnotationsView();
    },
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", Object.keys(mutations)),
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions))
    }
};
</script>

<template lang="html">
    <div id="tool-mobilityDataDraw-view-annotations">
        <section
            id="tool-mobilityDataDraw-view-annotations-section-drawingMode"
        >
            <h4>
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.label.drawingMode"
                    )
                }}
            </h4>

            <DrawingModeSelection />

            <p v-if="drawingMode === constants.drawingModes.POINT" class="hint">
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.annotations.pointDrawingHint"
                    )
                }}
            </p>
            <p v-if="drawingMode === constants.drawingModes.LINE" class="hint">
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.annotations.routeDrawingHint"
                    )
                }}
            </p>
            <p v-if="drawingMode === constants.drawingModes.AREA" class="hint">
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.annotations.areaDrawingHint"
                    )
                }}
            </p>
        </section>

        <section
            id="tool-mobilityDataDraw-view-annotations-section-annotations"
        >
            <h4>
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.label.annotations"
                    )
                }}
            </h4>

            <p v-if="!annotations.length">
                {{
                    $t(
                        "additional:modules.tools.mobilityDataDraw.annotations.introduction"
                    )
                }}
            </p>

            <ScrollContainerWithShadows v-else>
                <v-expansion-panels
                    class="annotations"
                    :value="selectedFeatureGeometryIndex"
                >
                    <AnnotationPanel
                        v-for="annotation in annotations"
                        :key="annotation.geometryIndex"
                        :feature="annotation.feature"
                        :geometry-index="annotation.geometryIndex"
                        :annotation-title="annotation.title"
                        :comment="annotation.comment"
                    />
                </v-expansion-panels>
            </ScrollContainerWithShadows>
        </section>
    </div>
</template>

<style lang="less" scoped>
#tool-mobilityDataDraw-view-annotations {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    min-height: 0;
}

.hint {
    margin: 16px 0 0;
}

#tool-mobilityDataDraw-view-annotations-section-annotations {
    flex-grow: 1;
    min-height: 0;

    > div {
        max-height: calc(100% - 39px);
    }
}

.annotations {
    width: calc(100% - 4px);
    margin: 0 2px;
}
</style>
