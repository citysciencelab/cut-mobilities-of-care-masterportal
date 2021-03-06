<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "AnnotationPanel",
    components: {},
    props: {
        // The map feature of the annotation
        feature: {
            type: Object,
            default: null
        },
        // The geometry index of the annotation
        geometryIndex: {
            type: Number,
            default: null
        },
        // The title of the annotation
        annotationTitle: {
            type: String,
            default: ""
        },
        // The comment to the annotation
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
         * Whether this annotation is disabled or not.
         */
        annotationIsDisabled: function() {
            return (
                this.currentInteraction ===
                    this.constants.interactionTypes.MODIFY &&
                !this.feature.get("isSelected")
            );
        },

        /**
         * Whether this annotation is readonly or not.
         */
        annotationIsReadonly: function() {
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
         * Selects the feature of the opened annotation
         * @param {Event}  event   The event fired by toggling a annotation panel
         * @returns {void}
         */
        onClickAnnotation(event) {
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

            this.selectAnnotationFeature(selectedIndex);
        },

        /**
         * Sets the title for the opened annotation
         * @param {Event}   event   The event fired by changing the title input
         * @returns {void}
         */
        onSetTitle(event) {
            const title = event.target.value;
            this.setAnnotationProperties({
                geometryIndex: this.geometryIndex,
                title
            });
        },

        /**
         * Sets the comment for the opened annotation
         * @param {Event}   event   The event fired by changing the comment input
         * @returns {void}
         */
        onSetComment(event) {
            const comment = event.target.value;
            this.setAnnotationProperties({
                geometryIndex: this.geometryIndex,
                comment
            });
        },

        /**
         * Handles deleting the annotation after confirmation
         * @returns {void}
         */
        onDelete() {
            const confirmActionSettings = {
                actionConfirmedCallback: () => {
                    this.deleteAnnotation(this.geometryIndex);
                },
                confirmCaption: this.$t(
                    "additional:modules.tools.mobilityDataDraw.confirm.deleteAnnotation.confirmButton"
                ),
                denyCaption: this.$t(
                    "additional:modules.tools.mobilityDataDraw.confirm.deleteAnnotation.denyButton"
                ),
                textContent: this.$t(
                    "additional:modules.tools.mobilityDataDraw.confirm.deleteAnnotation.description"
                ),
                headline: this.$t(
                    "additional:modules.tools.mobilityDataDraw.confirm.deleteAnnotation.title"
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

<template lang="html" v-if="feature">
    <v-expansion-panel
        class="annotation"
        :disabled="annotationIsDisabled"
        :readonly="annotationIsReadonly"
        @click="onClickAnnotation"
    >
        <v-expansion-panel-header disable-icon-rotate>
            <template v-slot:actions>
                <v-icon dense :title="comment">
                    {{ comment ? "comment" : "" }}
                </v-icon>
            </template>

            <div class="annotation-header">
                <input
                    class="annotation-title"
                    :placeholder="
                        $t(
                            'additional:modules.tools.mobilityDataDraw.label.annotation'
                        )
                    "
                    :value="annotationTitle"
                    @change="onSetTitle"
                    @click.stop
                />
            </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <div class="form-group">
                <label class="form-label">
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.label.routeComment"
                        )
                    }}
                </label>
                <textarea
                    class="form-control"
                    :value="comment"
                    @change="onSetComment"
                />
            </div>

            <div class="annotation-actions">
                <v-btn
                    v-if="
                        currentInteraction !== constants.interactionTypes.MODIFY
                    "
                    @click="startModifyingAnnotationFeature(geometryIndex)"
                >
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.button.startModifyAnnotation"
                        )
                    }}
                </v-btn>
                <v-btn v-else @click="stopModifyingAnnotationFeature">
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.button.stopModifyAnnotation"
                        )
                    }}
                </v-btn>

                <v-btn
                    :disabled="
                        currentInteraction === constants.interactionTypes.MODIFY
                    "
                    @click="onDelete"
                >
                    {{
                        $t(
                            "additional:modules.tools.mobilityDataDraw.button.deleteAnnotation"
                        )
                    }}
                </v-btn>
            </div>
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<style lang="less" scoped>
.annotation {
    &.v-expansion-panel--disabled {
        background-color: #f2f2f2;
    }

    &-header {
        max-width: calc(100% - 20px);
    }

    &-title {
        width: calc(100% - 20px);
        margin: -5px 0;
        padding: 5px 0;
        text-overflow: ellipsis;
    }

    &-actions  {
        margin-top: 15px;

        > button {
            position: relative !important;
            margin-top: 5px;
        }
    }
}
</style>
