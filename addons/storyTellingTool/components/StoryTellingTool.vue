<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import Tool from "../../../src/modules/tools/Tool.vue";
import StoryCreator from "./storyCreator/StoryCreator.vue";
import StoryPlayer from "./storyPlayer/StoryPlayer.vue";
import actions from "../store/actionsStoryTellingTool";
import getters from "../store/gettersStoryTellingTool";
import mutations from "../store/mutationsStoryTellingTool";
import * as constants from "../store/constantsStoryTellingTool";

export default {
    name: "StoryTellingTool",
    components: {
        Tool,
        StoryCreator,
        StoryPlayer
    },
    data() {
        return {
            constants,
            mode: null,
            storyConfPath: Config.storyConf
        };
    },
    computed: {
        ...mapGetters("Tools/StoryTellingTool", Object.keys(getters)),

        /**
         * The story telling tool options
         */
        modeOptions() {
            return Object.values(this.constants.storyTellingModes).map(
                mode => ({
                    mode,
                    icon: this.constants.storyTellingModeIcons[mode],
                    title: this.$t(
                        "additional:modules.tools.storyTellingTool." + mode
                    ),
                    disabled:
                        mode === this.constants.storyTellingModes.PLAY &&
                        !this.storyConfPath
                })
            );
        }
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
         * Starts the action for activation or deactivation processes.
         * @param {Boolean} value Value deciding whether the tool gets activated or deactivated.
         * @returns {void}
         */
        active(value) {
            if (!value) {
                this.mode = null;
            }
        }
    },
    /**
     * Put initialize here if mounting occurs after config parsing
     * @returns {void}
     */
    mounted() {
        this.applyTranslationKey(this.name);
    },
    methods: {
        ...mapMutations("Tools/StoryTellingTool", Object.keys(mutations)),
        ...mapActions("Tools/StoryTellingTool", Object.keys(actions)),

        /**
         * Handles story telling mode changes.
         * @param {Number} index the index of the new story telling mode
         * @returns {void}
         */
        onChangeStoryTellingMode(index) {
            this.mode = Object.values(this.constants.storyTellingModes)[index];
        },

        /**
         * Closes this tool window by setting active to false
         * @returns {void}
         */
        close() {
            const closeStoryTellingTool = () => {
                this.setActive(false);
                this.resetModule();

                // TODO replace trigger when Menu is migrated
                // set the backbone model to active false for changing css class in menu (menu/desktop/tool/view.toggleIsActiveClass)
                // else the menu-entry for this tool is always highlighted
                const model = Radio.request(
                    "ModelList",
                    "getModelByAttributes",
                    {
                        id: this.$store.state.Tools.StoryTellingTool.id
                    }
                );

                if (model) {
                    model.set("isActive", false);
                }
            };

            // Confirm tool closing if user is creating a story
            const isCreatingAStory =
                this.mode === this.constants.storyTellingModes.CREATE &&
                JSON.stringify(
                    this.$store.state.Tools.StoryTellingTool.storyConf
                ) !== JSON.stringify(this.constants.emptyStoryConf);

            if (isCreatingAStory) {
                const confirmActionSettings = {
                    actionConfirmedCallback: closeStoryTellingTool,
                    confirmCaption: this.$t(
                        "additional:modules.tools.storyTellingTool.confirm.closeStoryCreation.confirmButton"
                    ),
                    denyCaption: this.$t(
                        "additional:modules.tools.storyTellingTool.confirm.closeStoryCreation.denyButton"
                    ),
                    textContent: this.$t(
                        "additional:modules.tools.storyTellingTool.confirm.closeStoryCreation.description"
                    ),
                    headline: this.$t(
                        "additional:modules.tools.storyTellingTool.confirm.closeStoryCreation.title"
                    ),
                    forceClickToClose: true
                };
                this.$store.dispatch(
                    "ConfirmAction/addSingleAction",
                    confirmActionSettings
                );
            } else {
                closeStoryTellingTool();
            }
        }
    }
};
</script>

<template lang="html">
    <Tool
        :title="$t(name)"
        :icon="glyphicon"
        :active="active"
        :render-to-window="renderToWindow"
        :resizable-window="resizableWindow"
        :deactivate-gfi="deactivateGFI"
        :initial-width="initialWidth"
        :initial-width-mobile="initialWidthMobile"
    >
        <template #toolBody>
            <v-app v-if="active" id="tool-storyTellingTool" :class="mode">
                <v-item-group
                    v-if="!mode"
                    :value="mode"
                    @change="onChangeStoryTellingMode"
                    id="tool-storyTellingTool-modeSelection"
                >

                    <v-flex v-for="option in modeOptions"  :key="option.title">
                        <v-item v-slot="{ active, toggle }" >
                            <v-card  :disabled="option.disabled" class="my-4">
                                <v-img v-if="option.title == 'Story starten'"
                                    src="https://raw.githubusercontent.com/herzogrh/faircare-verkehr/main/assets/img/stroller-1.jpg"
                                    height="200px"
                                    ></v-img>
                                <v-card-title v-if="option.title == 'Story starten'">FairCare Verkehr</v-card-title>
                                <v-card-subtitle v-if="option.title == 'Story starten'">Eine Geschichte zur Mobilität von Personen, die unbezahlte Sorgearbeit ausüben.</v-card-subtitle>
                                <v-card-actions>
                                    <v-btn v-if="option.title == 'Story starten'" text @click="toggle" >
                                        {{ option.title }}
                                    </v-btn>
                                    <v-col class="text-center" v-if="option.title == 'Story erstellen'">
                                        <p><i>- Experimentell -</i></p>
                                        <v-btn   outlined small color="" @click="toggle" >
                                            <v-icon>add</v-icon>
                                            Eigene {{ option.title }}
                                        </v-btn>
                                    </v-col>
                                    
                                </v-card-actions>
                            </v-card>
                        </v-item>
                        <v-spacer></v-spacer>
                    </v-flex>
                </v-item-group>

                <StoryCreator
                    v-if="mode === constants.storyTellingModes.CREATE"
                />
                <StoryPlayer
                    v-if="
                        mode === constants.storyTellingModes.PLAY &&
                            storyConfPath
                    "
                    :storyConfPath="storyConfPath"
                />
            </v-app>
        </template>
    </Tool>
</template>

<style lang="less" scoped>
#tool-storyTellingTool {
    background: none;

    &.play {
        max-height: calc(72vh - 40px);
    }

    &::v-deep {
        .v-application--wrap {
            min-height: 0;

            > div {
                height: 100%;
            }
        }
    }
}

#tool-storyTellingTool-modeSelection {
    .v-icon {
        color: currentColor;
    }
}
</style>

<style lang="less">
// Fix masterportal main menu styles for "TABLE" UI Style

.custom-table-row {
    margin-right: -15px;
    margin-left: -15px;
}

.custom-table-column {
    position: relative;

    @media (min-width: 992px) {
        float: left;
    }
}

#table-nav-cat-panel-toggler {
    display: none;

}


.table-nav-main{
    background-color: rgba(0, 0, 0, 0);
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
    background-color: white;
    width: 550px;
    height: 60px;
    padding: 10px;
}

.table-tools {
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0);
    background-color: white;
    margin-left: -125px;
    margin-top: 10px;


}

.table-tools-menu {
    background-color: white;
    box-shadow: 0 4px 8px 0 rgba(115, 193, 169, 0.0);
    border: 2px solid #8ea0d2;
    left: -100px;
    bottom: 50px;

}

.table-tool {
    border: 0px;
    padding: 5px;
    border-radius: 5px;
}

.table-tool:hover {
    background-color: fade(@main-blue , 20%);
}


#table-searchForm input#searchInput.form-control {
    font-family: "Arial", sans-serif;
    font-size: 12px;
    width: 340px;
}

#searchInput::placeholder, .form-control::placeholder{
    font-family: "Arial", sans-serif;
    font-size: 12px;
}

#searchInputUL {
    background-color: white;
}

.table-tools:hover {
    background-color: #cddcf2;
}


.icon-burgermenu_alt.collapsed::before {
    color: #73c1a9;
}

.table-nav-layers-panel {
    z-index: 10;
    background-color: white;
    box-shadow: 0 4px 8px 0 rgba(115, 193, 169, 0.0);
    border: 2px solid #73c1a9;
}

#table-nav-layers-panel-toggler{
    background-color: #bbf0de;
}

#funnel, .search-funnel {
    display: none;
}

#table-searchForm .btn-table-search:hover {
    background-color: #f4dadf;
}


.icon-burgermenu_alt #table-nav-layers-panel-toggler {
    background-color: #73c1a9;
    border-radius: 8px;
}

.icon-burgermenu_alt .icon-cross1::before {
    color: #FFF;
}

#table-nav-layers-panel .layer-settings-activated {
    background-color: rgba(115, 193, 169, 0.1);

}

.icon-tools::before {
    color: rgb(116, 132, 176)
}

.icon-tools::after {
    color: rgba(142, 180, 210,1)
}

.table-tools-active .icon-tools::before {
    color: rgba(142, 180, 210,1)
}

.icon-drag::before {
    color: #c0c0c0
}

.icon-search::before {
    color: #f2b1b7
}

    // New style for the Storytelling tool

    //Colors
    @main-pink: #f2b1b7;
    @main-mint: #73c1a9;
    @main-blue: #8ea0d2;
    @white: #FFFFFF;

    .win-heading, .table-tool-win-all-vue {
        background-color: @main-blue !important;
    }

    .legend-title-table, ui-draggable-handle {
        background-color: @main-mint !important;
        border-bottom: 0px !important;

    }

    .legend-window-table .legend-content, .panel, .panel-default {
        background-color: @white !important;

    }

    .panel-heading, .layer-title {
        border-radius: 4px !important;
        background-color: fade(@main-mint , 20%) !important;
        border-bottom: 0px !important;
    }

    .win-body-vue {
        background-color: @white !important;
    }

</style>