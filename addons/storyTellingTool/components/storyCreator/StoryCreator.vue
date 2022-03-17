<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import StoryForm from "./StoryForm.vue";
import StepForm from "./StepForm.vue";
import StoryPlayer from "../storyPlayer/StoryPlayer.vue";
import actions from "../../store/actionsStoryTellingTool";
import getters from "../../store/gettersStoryTellingTool";
import mutations from "../../store/mutationsStoryTellingTool";
import * as constants from "../../store/constantsStoryTellingTool";

export default {
    name: "StoryCreator",
    components: {
        StoryForm,
        StepForm,
        StoryPlayer
    },
    data() {
        return {
            constants,
            view: constants.storyCreationViews.STORY_CREATION,
            stepToEdit: null
        };
    },
    computed: {
        ...mapGetters("Tools/StoryTellingTool", Object.keys(getters))
    },
    mounted() {
        this.setStoryConf({ ...this.constants.emptyStoryConf });
    },
    methods: {
        ...mapMutations("Tools/StoryTellingTool", Object.keys(mutations)),
        ...mapActions("Tools/StoryTellingTool", Object.keys(actions)),

        /**
         * Handle editing a step
         * @param {Object} step the step to edit
         * @returns {void}
         */
        onEditStep(step) {
            this.stepToEdit = step;
            this.view = this.constants.storyCreationViews.STEP_CREATION;
        },

        /**
         * Return to the story form
         * @returns {void}
         */
        returnToStoryForm() {
            this.stepToEdit = null;
            this.view = this.constants.storyCreationViews.STORY_CREATION;
        }
    }
};
</script>

<template lang="html">
    <div id="tool-storyTellingTool-creator">
        <StoryForm
            v-if="view === constants.storyCreationViews.STORY_CREATION"
            @openView="newView => (view = newView)"
            @editStep="onEditStep"
        />

        <StepForm
            v-if="view === constants.storyCreationViews.STEP_CREATION"
            :isEditing="Boolean(stepToEdit)"
            :initialStep="stepToEdit"
            @return="returnToStoryForm"
        />

        <div
            v-if="view === constants.storyCreationViews.PREVIEW"
            class="tool-storyTellingTool-creator-preview"
        >
            <div class="tool-storyTellingTool-creator-preview-header primary">
                <v-btn color="white" icon @click="returnToStoryForm">
                    <v-icon>arrow_back_ios_new</v-icon>
                </v-btn>
                <h4 class="white--text">Vorschau</h4>
            </div>

            <StoryPlayer isPreview />
        </div>
    </div>
</template>

<style lang="less" scoped>
.tool-storyTellingTool-creator-preview {
    display: grid;
    grid-template-rows: auto 1fr;
    grid-gap: 20px;
    max-height: calc(72vh - 40px);

    &-header {
        display: flex;
        align-items: center;
        justify-content: center;

        > button {
            position: absolute;
            left: 0;
            margin: 2px;
        }
    }
}
</style>
