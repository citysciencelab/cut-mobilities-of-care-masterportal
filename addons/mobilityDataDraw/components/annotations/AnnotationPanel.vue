<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import AudioRecorderWrapper from "../AudioRecorderWrapper.vue";
import ImageUploader from "../ImageUploader.vue";
import * as toolConstants from "../../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../../shared/constants/mobilityData";
import actions from "../../store/actionsMobilityDataDraw";
import getters from "../../store/gettersMobilityDataDraw";
import mutations from "../../store/mutationsMobilityDataDraw";

export default {
    name: "AnnotationPanel",
    components: {
        AudioRecorderWrapper,
        ImageUploader
    },
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
    data () {
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
                    this.removeImageUpload(this.geometryIndex);
                    this.removeAudioRecord(this.geometryIndex);
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
        <v-expansion-panel-header
            disable-icon-rotate
            @keyup.space.prevent
        >
            <template v-slot:actions>
                <v-icon dense :title="comment" :class="{ 'invisible-icon': comment === ''}" style="margin-right: 5px">
                    comment
                </v-icon>
                <v-icon v-if="selectedAnnotationIndex === geometryIndex" class="annotation-header-arrow">
                    keyboard_double_arrow_up
                </v-icon>
                <v-icon v-else class="annotation-header-arrow">
                    keyboard_double_arrow_down
                </v-icon>
            </template>
            <div class="header-start-icons">
                <v-icon>
                    {{ constants.drawingModeIcons[this.feature.values_['mode']] }}
                </v-icon>
                <v-icon class="mobility-data-segment-icon"
                        :class="{ 'invisible-icon': !this.feature.values_['mobilityMode'] }">
                    {{ constants.mobilityModeIcons[this.feature.values_['mobilityMode']] ? constants.mobilityModeIcons[this.feature.values_['mobilityMode']] : 'directions_bike' }}
                </v-icon>
            </div>

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
                    @click="onClickAnnotation"
                    @click.native.stop
                />
            </div>
        </v-expansion-panel-header>
        <v-expansion-panel-content>
            <div class="form-group text-input-form">
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
                    <v-icon>
                        edit
                    </v-icon>
                </v-btn>
                <v-btn v-else @click="stopModifyingAnnotationFeature">
                    <v-icon>
                        save
                    </v-icon>
                </v-btn>

                <v-btn
                    :disabled="
                        currentInteraction === constants.interactionTypes.MODIFY
                    "
                    @click="onDelete"
                >
                    <v-icon>
                        delete_forever
                    </v-icon>
                </v-btn>
            </div>
            <AudioRecorderWrapper v-bind:audioRecordId="geometryIndex" />
            <ImageUploader v-bind:imageUploadIndex="geometryIndex" />
        </v-expansion-panel-content>
    </v-expansion-panel>
</template>

<style lang="less" scoped>
.annotation {

    &.v-expansion-panel--disabled {
        background-color: #f2f2f2;
    }

    // Purely a hack for a constant layout
    .invisible-icon {
        color: rgba(0,0,0,.0) !important;
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
        text-align: right;
        margin-top: 15px;

        > button:first-of-type {
            margin-right: 10px;
        }
        > button {
            position: relative !important;
            padding: 5px !important;
            min-width: 0 !important;
        }
    }

    .annotation-header {
        display: flex;
        flex-grow: 10;
        i {
            margin-right: 5px;
        }
        input {
            font: inherit;
        }
        .annotation-title {
            border: 1px solid lightgray;
            padding-left: 5px;
        }
    }

    .v-expansion-panel-content::v-deep .v-expansion-panel-content__wrap {
        .text-input-form {
            margin-bottom: 0;
        }
        .annotation-actions {
            margin-top: 5px;
        }
    }


    // Mobile view without resize bar - no padding
    @media only screen and (max-width: 440px) {

        .v-expansion-panel-content::v-deep .v-expansion-panel-content__wrap {
            padding: 6px !important;

            .annotation-actions {
                height: 30px !important;
                padding: 4px !important;
            }
        }

        .v-expansion-panel-header,
        .v-expansion-panel-content{
            padding: 6px !important;
        }


        .header-start-icons {
            width: 70px;
            display: inline-flex;
        }

        .annotation-title {
            width: 100%;
        }
    }
}
</style>
