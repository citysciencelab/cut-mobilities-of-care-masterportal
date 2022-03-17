<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import axios from "axios";
import StoryNavigation from "./StoryNavigation.vue";
import actions from "../../store/actionsStoryTellingTool";
import getters from "../../store/gettersStoryTellingTool";
import mutations from "../../store/mutationsStoryTellingTool";
import {
    getStepReference,
    getHTMLContentReference
} from "../../utils/getReference";

const fetchDataFromUrl = url => {
    return axios
        .get(url)
        .then(response => response.data)
        .then(content => content);
};

export default {
    name: "StoryPlayer",
    components: {
        StoryNavigation
    },
    props: {
        // The path to the story configuration to load
        storyConfPath: {
            type: String,
            default: null
        },
        // Whether the story player is in preview mode or not
        isPreview: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            getStepReference,
            getHTMLContentReference,
            currentStepIndex: 0,
            loadedContent: null,
            isHovering: null
        };
    },
    computed: {
        ...mapGetters("Tools/StoryTellingTool", Object.keys(getters)),

        /**
         * The current selected step of the story.
         */
        currentStep() {
            return this.currentStepIndex !== null
                ? this.storyConf && this.storyConf.steps[this.currentStepIndex]
                : null;
        },

        /**
         * The current selected chapter of the story.
         */
        currentChapter() {
            return (
                this.storyConf &&
                this.storyConf.chapters.find(
                    ({ chapterNumber }) =>
                        this.currentStep &&
                        this.currentStep.associatedChapter === chapterNumber
                )
            );
        }
    },
    watch: {
        /**
         * Handles step changes.
         * @returns {void}
         */
        currentStepIndex() {
            this.loadStep();
        }
    },
    mounted() {
        if (this.storyConfPath) {
            fetchDataFromUrl(this.storyConfPath).then(loadedStoryConf => {
                this.setStoryConf(loadedStoryConf);
                this.loadStep();
            });
        }

        if (this.isPreview && this.storyConf) {
            this.loadStep();
        }
    },
    beforeDestroy() {
        // Hides all story layers
        const layerList = Radio.request("ModelList", "getModelsByAttributes", {
            isVisibleInTree: true
        });

        for (const layer of layerList) {
            const isStepLayer = (
                (this.currentStep && this.currentStep.layers) ||
                []
            ).includes(Number(layer.attributes.id));

            if (isStepLayer && layer.attributes.isVisibleInMap) {
                this.disableLayer(layer);
            }
        }
        Radio.trigger("TableMenu", "rerenderLayers");
    },
    methods: {
        ...mapActions("Tools", ["setToolActive"]),
        ...mapMutations("Tools/StoryTellingTool", Object.keys(mutations)),
        ...mapActions("Tools/StoryTellingTool", Object.keys(actions)),
        // These application wide getters and setters can be found in 'src/modules/map/store'
        ...mapMutations("Map", ["setCenter", "setLayerVisibility"]),
        ...mapGetters("Map", ["layerList", "visibleLayerList", "map"]),

        /**
         * Activates a tool
         * @param {Object} toolId the id of the tool to activate
         * @returns {void}
         */
        activateTool(toolId) {
            const configuredTools = this.$store.state.Tools.configuredTools;
            const tool = configuredTools.find(({ key }) => key === toolId);

            if (tool) {
                this.$store.commit(
                    `Tools/${tool.component.name}/setActive`,
                    true
                );
            }
        },

        /**
         * Toggles a layer on the map
         * @param {Object} layer the layer to enable
         * @param {Boolean} enabled enables the layer if `true`, disables the layer if `false`
         * @returns {void}
         */
        toggleLayer(layer, enabled) {
            layer.setIsVisibleInMap(enabled);
            layer.set("isSelected", enabled);
        },

        /**
         * Enables a layer on the map
         * @param {Object} layer the layer to enable
         * @returns {void}
         */
        enableLayer(layer) {
            this.toggleLayer(layer, true);
        },

        /**
         * Disables a layer on the map
         * @returns {Object} layer the layer to disable
         * @returns {void}
         */
        disableLayer(layer) {
            this.toggleLayer(layer, false);
        },

        /**
         * Sets up the tool window and content for the selected step.
         * @returns {void}
         */
        loadStep() {
            if (!this.currentStep) {
                return;
            }

            // Updates the tool width
            if (this.currentStep.stepWidth) {
                this.setInitialWidth(this.currentStep.stepWidth);
            }

            // Updates the map center
            if (this.currentStep.centerCoordinate) {
                const mapView = this.map().getView();

                mapView.animate({
                    center: this.currentStep.centerCoordinate,
                    duration: 2000,
                    zoom: this.currentStep.zoomLevel
                });
            }

            // Updates the map layers
            const layerList = Radio.request(
                "ModelList",
                "getModelsByAttributes",
                { isVisibleInTree: true }
            );

            for (const layer of layerList) {
                const isStepLayer = (this.currentStep.layers || []).includes(
                    layer.id
                );

                if (isStepLayer && !layer.attributes.isVisibleInMap) {
                    this.enableLayer(layer);
                } else if (!isStepLayer && layer.attributes.isVisibleInMap) {
                    this.disableLayer(layer);
                }
            }
            Radio.trigger("TableMenu", "rerenderLayers");

            // Updates the step html content
            const htmlReference = getHTMLContentReference(
                this.currentStep.associatedChapter,
                this.currentStep.stepNumber
            );

            if (this.storyConf.htmlFolder && this.currentStep.htmlFile) {
                // Load HTML file for the story step
                fetchDataFromUrl(
                    "./assets/" +
                        this.storyConf.htmlFolder +
                        "/" +
                        this.currentStep.htmlFile
                ).then(data => (this.loadedContent = data));
            } else if (this.isPreview && this.htmlContents[htmlReference]) {
                // Get temporary HTML for the story step preview
                this.loadedContent = this.htmlContents[htmlReference];
            } else {
                this.loadedContent = null;
            }

            // Activates or deactivates tools
            const interactionAddons = this.currentStep.interactionAddons || [];
            const configuredTools = this.$store.state.Tools.configuredTools;
            // Activate all tools of the current step
            interactionAddons.forEach(this.activateTool);
        }
    }
};
</script>

<template lang="html">
    <div
        v-if="storyConf !== undefined && storyConf.steps && currentStep"
        id="tool-storyTellingTool-player"
    >
        <div id="tool-storyTellingTool-currentStep">
            <!--<h3>{{ storyConf.name }}</h3>-->
            <p> </p>
            <h2 v-if="currentChapter">{{ currentChapter.chapterTitle }}</h2>
            <h1>{{ currentStep.title }}</h1>

            <div v-if="currentStep" class="tool-storyTellingTool-content">
                <div v-if="loadedContent" v-html="loadedContent" />
            </div>
        </div>

        <StoryNavigation
            v-model="currentStepIndex"
            :currentChapter="currentStep && currentStep.associatedChapter"
            :steps="storyConf.steps"
        />
    </div>

    <div v-else id="tool-storyTellingTool-tableOfContents">
        <h1>{{ storyConf.name }}</h1>

        <h2>
            {{
                $t("additional:modules.tools.storyTellingTool.tableOfContents")
            }}
        </h2>

        <ol class="tableOfContents">
            <li v-for="chapter in storyConf.chapters">
                <span
                    @mouseover="isHovering = chapter.chapterNumber"
                    @mouseout="isHovering = null"
                    :class="{
                        'primary--text': isHovering === chapter.chapterNumber
                    }"
                    @click="
                        currentStepIndex = storyConf.steps.findIndex(
                            ({ associatedChapter }) =>
                                associatedChapter === chapter.chapterNumber
                        )
                    "
                >
                    {{ chapter.chapterNumber }}
                    {{ chapter.chapterTitle }}
                </span>
                <ol>
                    <li
                        v-for="(step, stepIndex) in storyConf.steps"
                        v-if="step.associatedChapter === chapter.chapterNumber"
                        @mouseover.stop="
                            isHovering = getStepReference(
                                step.associatedChapter,
                                step.stepNumber
                            )
                        "
                        @mouseout.stop="isHovering = null"
                        :class="{
                            'primary--text':
                                isHovering ===
                                getStepReference(
                                    step.associatedChapter,
                                    step.stepNumber
                                )
                        }"
                        @click.stop="currentStepIndex = stepIndex"
                    >
                        {{
                            getStepReference(
                                step.associatedChapter,
                                step.stepNumber
                            )
                        }}
                        {{ step.title }}
                    </li>
                </ol>
            </li>
        </ol>
    </div>
</template>

<style lang="less" scoped>
#tool-storyTellingTool-player {
    display: grid;
    grid-template-rows: 1fr auto;
    grid-template-columns: 100%;
    grid-gap: 20px;
    min-height: 0;
    height: 100%;
}

#tool-storyTellingTool-currentStep,
#tool-storyTellingTool-tableOfContents {
    display: grid;
    grid-gap: 10px;
    overflow: hidden;
}

.tool-storyTellingTool-content {
    overflow: auto;

    &::v-deep {
        img {
            max-width: 100%;
        }
    }
}

.tableOfContents {
    padding-left: 0;
    overflow: auto;
    font-size: 1rem;
    line-height: 1.75;

    &,
    ol {
        list-style: none;
    }

    > li {
        &:not(last-child) {
            margin-bottom: 10px;
        }

        > ol li,
        > span {
            display: block;
            cursor: pointer;
        }
    }
}
</style>
