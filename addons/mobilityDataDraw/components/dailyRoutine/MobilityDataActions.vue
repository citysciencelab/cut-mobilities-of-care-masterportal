<script>
import { mapGetters, mapActions } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";

export default {
    name: "MobilityDataActions",
    components: {},
    props: {
        // The geometry index of the mobility data to modify
        geometryIndex: {
            type: Number,
            default: null
        },
        // The type of mobility data ("route" or "location")
        type: {
            type: String,
            default: null
        }
    },
    data() {
        return {
            constants: toolConstants
        };
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters))
    },
    methods: {
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions)),

        /**
         * Handles deleting the mobility data feature after confirmation
         * @returns {void}
         */
        onDelete() {
            const confirmKey =
                this.type === "location"
                    ? "deleteLocationFeature"
                    : "deleteRouteFeature";
            const confirmActionSettings = {
                actionConfirmedCallback: () => {
                    this.deleteMobilityDataFeature(this.geometryIndex);
                },
                confirmCaption: this.$t(
                    `additional:modules.tools.mobilityDataDraw.confirm.${confirmKey}.confirmButton`
                ),
                denyCaption: this.$t(
                    `additional:modules.tools.mobilityDataDraw.confirm.${confirmKey}.denyButton`
                ),
                textContent: this.$t(
                    `additional:modules.tools.mobilityDataDraw.confirm.${confirmKey}.description`
                ),
                headline: this.$t(
                    `additional:modules.tools.mobilityDataDraw.confirm.${confirmKey}.title`
                ),
                forceClickToClose: true
            };
            this.$store.dispatch(
                "ConfirmAction/addSingleAction",
                confirmActionSettings
            );
        }
    }
};
</script>

<template lang="html">
    <div class="mobility-data-actions">
        <v-btn
            v-if="currentInteraction !== constants.interactionTypes.MODIFY"
            @click="startModifyingMobilityDataFeature(geometryIndex)"
        >
            {{
                $t(
                    `additional:modules.tools.mobilityDataDraw.button.${
                        type === "location"
                            ? "startModifyLocation"
                            : "startModifyRoute"
                    }`
                )
            }}
        </v-btn>
        <v-btn v-else @click="stopModifyingMobilityDataFeature">
            {{
                $t(
                    `additional:modules.tools.mobilityDataDraw.button.${
                        type === "location"
                            ? "stopModifyLocation"
                            : "stopModifyRoute"
                    }`
                )
            }}
        </v-btn>

        <v-btn
            :disabled="currentInteraction === constants.interactionTypes.MODIFY"
            @click="onDelete"
        >
            {{
                $t(
                    `additional:modules.tools.mobilityDataDraw.button.${
                        type === "location" ? "deleteLocation" : "deleteRoute"
                    }`
                )
            }}
        </v-btn>
    </div>
</template>

<style lang="less" scoped>
.mobility-data-actions {
    margin-top: 15px;

    > button {
        position: relative !important;
        margin-top: 5px;
    }
}
</style>
