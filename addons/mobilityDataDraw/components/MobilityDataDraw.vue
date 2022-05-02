<script src="../../../shared/constants/mobilityData.js"></script>
<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import Tool from "../../../src/modules/tools/Tool.vue";
import PersonalDataView from "./personalData/PersonalDataView.vue";
import DailyRoutineView from "./dailyRoutine/DailyRoutineView.vue";
import AnnotationsView from "./annotations/AnnotationsView.vue";
import ClosingView from "./closing/ClosingView.vue";
import * as toolConstants from "../store/constantsMobilityDataDraw";
import * as sharedConstants from "../../../shared/constants/mobilityData";
import actions from "../store/actionsMobilityDataDraw";
import getters from "../store/gettersMobilityDataDraw";
import mutations from "../store/mutationsMobilityDataDraw";
// import 'material-design-icons-iconfont/dist/material-design-icons.css'

export default {
    name: "MobilityDataDraw",
    components: {
        Tool,
        PersonalDataView,
        DailyRoutineView,
        AnnotationsView,
        ClosingView
    },
    data() {
        return {
            constants: { ...toolConstants, ...sharedConstants },
            isLoadingNext: false,
            initialState: JSON.parse(
                JSON.stringify(this.$store.state.Tools.MobilityDataDraw)
            )
        };
    },
    computed: {
        ...mapGetters("Tools/MobilityDataDraw", Object.keys(getters)),

        /**
         * The number of the first view.
         */
        minView: function() {
            return Math.min(...Object.values(this.constants.views));
        },

        /**
         * The number of the last view.
         */
        maxView: function() {
            return Math.max(...Object.values(this.constants.views));
        },

        /**
         * The number of the first drawing view.
         */
        minDrawingView: function() {
            return Math.min(...this.constants.drawingViews);
        },

        /**
         * The number of the last drawing view.
         */
        maxDrawingView: function() {
            return Math.max(...this.constants.drawingViews);
        },

        /**
         * Whether the next button is disabled or not
         *
         * Disable the button when in modifying mode or
         * if no mobility data was drawn.
         */
        nextButtonDisabled: function() {
            const isModifying =
                    this.currentInteraction ===
                    this.constants.interactionTypes.MODIFY,
                noMobilityDataDrawn = !this.mobilityData.length;

            return (
                (this.view === this.constants.views.DAILY_ROUTINE_VIEW &&
                    noMobilityDataDrawn) ||
                isModifying
            );
        },
        possibleMobileWidth: function() {
            return this.isMobile() ? this.initialState.initialWidthMobile+"px" : "";
        },
    },
    created() {
        this.$on("close", this.close);

        // Fix masterportal main menu styles for "TABLE" UI Style
        if (Radio.request("Util", "getUiStyle") === "TABLE") {
            const tableNavigationElement = document.querySelector("#table-nav");
            if (tableNavigationElement) {
                tableNavigationElement.classList.remove("row");
                tableNavigationElement.classList.add("custom-table-row");
            }

            const tableNavigationMainColumnElement = document.querySelector(
                "#table-nav > .col-md-4"
            );
            if (tableNavigationMainColumnElement) {
                tableNavigationMainColumnElement.classList.remove("col-md-4");
                tableNavigationMainColumnElement.classList.add(
                    "custom-table-column"
                );
            }

            const tableNavigationSecondaryColumnElements = document.querySelectorAll(
                "#table-nav > .col-md-2"
            );
            tableNavigationSecondaryColumnElements.forEach(element => {
                element.classList.remove("col-md-2");
                element.classList.add("custom-table-column");
            });
        }
    },
    watch: {
        /**
         * Toggles the modifying class.
         * @param {Boolean} value Value deciding whether the tool is in modifying mode or not.
         * @returns {void}
         */
        currentInteraction(value) {
            const mobilityDataDrawElement = document.getElementById(
                "tool-mobilityDataDraw"
            );

            if (mobilityDataDrawElement) {
                mobilityDataDrawElement.classList.toggle(
                    "isModifying",
                    value === this.constants.interactionTypes.MODIFY
                );
            }
        }
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted() {
        if (this.active) {
            this.setActive(true);
        }
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/MobilityDataDraw", Object.keys(mutations)),
        ...mapActions("Tools/MobilityDataDraw", Object.keys(actions)),

        /**
         * Opens the previous view.
         * @returns {void}
         */
        previousView() {
            this.setView(Math.max(this.minView, this.view - 1));
        },

        /**
         * Opens the next view.
         * @returns {void}
         */
        nextView() {
            this.setView(Math.min(this.maxView, this.view + 1));
        },

        /**
         * Handles submitting data and opens the next view.
         * @returns {void}
         */
        submitDataAndNextView() {
            if (this.view === this.constants.views.PERSONAL_DATA_VIEW) {
                const confirmActionSettings = {
                    actionConfirmedCallback: () => {
                        this.isLoadingNext = true;
                        this.submitPersonalData()
                            .then(this.nextView)
                            .finally(() => {
                                this.isLoadingNext = false;
                            });
                    },
                    confirmCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.submitPersonalData.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.submitPersonalData.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.submitPersonalData.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.submitPersonalData.title"
                    ),
                    forceClickToClose: true
                };
                this.$store.dispatch(
                    "ConfirmAction/addSingleAction",
                    confirmActionSettings
                );
            } else if (this.view === this.constants.views.ANNOTATIONS_VIEW) {
                const confirmActionSettings = {
                    actionConfirmedCallback: () => {
                        this.isLoadingNext = true;
                        this.submitDrawnData()
                            .then(this.nextView)
                            .finally(() => {
                                this.isLoadingNext = false;
                            });
                    },
                    confirmCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.submitDrawnData.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.submitDrawnData.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.submitDrawnData.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.submitDrawnData.title"
                    ),
                    forceClickToClose: true
                };
                this.$store.dispatch(
                    "ConfirmAction/addSingleAction",
                    confirmActionSettings
                );
            } else {
                this.nextView();
            }
        },

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close() {
            const closeMobilityDataDraw = () => {
                this.setActive(false);
                this.resetModule();

                // TODO replace trigger when Menu is migrated
                // set the backbone model to active false for changing CSS class in menu (menu/desktop/tool/view.toggleIsActiveClass)
                // else the menu-entry for this tool is always highlighted
                const model = Radio.request(
                    "ModelList",
                    "getModelByAttributes",
                    {
                        id: this.$store.state.Tools.MobilityDataDraw.id
                    }
                );

                if (model) {
                    model.set("isActive", false);
                }
            };

            // Confirm tool closing if user has entered data
            const hasEnteredData =
                this.view !== this.initialState.view ||
                JSON.stringify(this.personalData) !==
                    JSON.stringify(this.initialState.personalData);

            if (hasEnteredData) {
                const confirmActionSettings = {
                    actionConfirmedCallback: closeMobilityDataDraw,
                    confirmCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.closeMobilityDataDraw.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.closeMobilityDataDraw.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.closeMobilityDataDraw.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.mobilityDataDraw.confirm.closeMobilityDataDraw.title"
                    ),
                    forceClickToClose: true
                };
                this.$store.dispatch(
                    "ConfirmAction/addSingleAction",
                    confirmActionSettings
                );
            } else {
                closeMobilityDataDraw();
            }
        },
        isMobile () {
            return (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i).test(navigator.userAgent);
        }
    }
};
</script>

<template lang="html">
    <!--
    <div>
        <v-btn
            rounded
            color="primary"
            dark
        >
            Rounded Button
            <v-icon dark>
                mdi-heart
            </v-icon>
        </v-btn>
        -->
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivateGFI="deactivateGFI"
        :initial-width="initialWidth"
        :initial-width-mobile="initialWidthMobile"
        :style="{width: possibleMobileWidth}"
    >
        <template v-slot:toolBody>
            <v-app
                v-if="active"
                id="tool-mobilityDataDraw"
                :style="constants.mobilityModeCSSColorVariables"
            >
                <PersonalDataView
                    v-if="view === constants.views.PERSONAL_DATA_VIEW"
                />
                <DailyRoutineView
                    v-if="view === constants.views.DAILY_ROUTINE_VIEW"
                />
                <AnnotationsView
                    v-if="view === constants.views.ANNOTATIONS_VIEW"
                />
                <ClosingView
                    v-if="view === constants.views.CLOSING_VIEW"
                    @close="close"
                />

                <div
                    id="tool-mobilityDataDraw-actions"
                    v-if="view !== constants.views.CLOSING_VIEW"
                >
                    <v-btn
                        v-if="view > minDrawingView"
                        class="tool-mobilityDataDraw-actions-previous"
                        @click="previousView"
                    >
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.button.previous"
                            )
                        }}
                    </v-btn>

                    <v-btn
                        v-if="view < maxDrawingView"
                        class="tool-mobilityDataDraw-actions-next"
                        :disabled="nextButtonDisabled"
                        :loading="isLoadingNext"
                        @click="submitDataAndNextView"
                    >
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.button.next"
                            )
                        }}
                    </v-btn>
                    <v-btn
                        v-else
                        class="tool-mobilityDataDraw-actions-submit"
                        :disabled="nextButtonDisabled"
                        :loading="isLoadingNext"
                        @click="submitDataAndNextView"
                    >
                        {{
                            $t(
                                "additional:modules.tools.mobilityDataDraw.button.submit"
                            )
                        }}
                    </v-btn>
                </div>
            </v-app>
        </template>
    </Tool>
    <!--</div>-->

</template>

<style lang="less" scoped>
@import "~variables";

#tool-mobilityDataDraw {
    --mobility-data-draw-background-color-hex: #fff;
    --mobility-data-draw-background-color-rgb: 255, 255, 255;

    flex-direction: column;
    height: 100%;
    background: none;

    &::v-deep {
        .v-application--wrap {
            min-height: 0;
        }

        section {
            &:not(:last-child) {
                margin-bottom: 20px;
            }

            &:first-child > :first-child {
                margin-top: 0;
            }
        }
    }

    &.isModifying {
        --mobility-data-draw-background-color-hex: #f2f2f2;
        --mobility-data-draw-background-color-rgb: 242, 242, 242;

        &::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            width: calc(100% + @padding * 2);
            height: calc(100% + @padding * 2);
            margin: calc(@padding * -1);
            background: var(--mobility-data-draw-background-color-hex);
        }
    }
}

// Styles for "TABLE" UI Style
.table-tool-win-all-vue {
    #tool-mobilityDataDraw {
        --mobility-data-draw-background-color-hex: #f2f2f2;
        --mobility-data-draw-background-color-rgb: 242, 242, 242;

        &.isModifying {
            --mobility-data-draw-background-color-hex: #d8d8d8;
            --mobility-data-draw-background-color-rgb: 216, 216, 216;
        }
    }
}

#tool-mobilityDataDraw-actions {
    display: flex;
    justify-content: space-between;
    margin-top: auto;
    padding-top: 20px;
}

.tool-mobilityDataDraw-actions-next,
.tool-mobilityDataDraw-actions-submit {
    position: relative !important;
    margin-left: auto;
}
</style>

<style lang="less">
// Fix masterportal main menu styles for "TABLE" UI Style
.custom-table-row {
    margin-right: -15px;
    margin-left: -15px;
}

// Fix sizing of map for tool without resize
#tool-sidebar-vue {
    // padding: 0 !important;
}

// Navigation butto styling
.control-icon {
    background-color: #f2f2f2 !important;
    color: #646262 !important;
    border-radius: 6px;
}

.custom-table-column {
    position: relative;

    @media (min-width: 992px) {
        float: left;
    }
}

// Fix touch operations on the map
// (see https://github.com/openlayers/openlayers/issues/10910)
// Can be removed when the masterportal updated OpenLayers to v6.4.0 or above
#map canvas {
    touch-action: none;
}
</style>
