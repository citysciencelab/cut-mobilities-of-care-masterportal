<script>
import { mapGetters, mapActions, mapMutations } from "vuex";
import actions from "../../store/actionsStoryTellingTool";
import getters from "../../store/gettersStoryTellingTool";
import mutations from "../../store/mutationsStoryTellingTool";
import * as constants from "../../store/constantsStoryTellingTool";
import { getStepReference } from "../../utils/getReference";

export default {
    name: "StoryForm",
    components: {},
    data() {
        return {
            constants,
            getStepReference
        };
    },
    computed: {
        ...mapGetters("Tools/StoryTellingTool", Object.keys(getters))
    },
    methods: {
        ...mapMutations("Tools/StoryTellingTool", Object.keys(mutations)),
        ...mapActions("Tools/StoryTellingTool", Object.keys(actions))
    }
};
</script>

<template lang="html">
    <div id="tool-storyTellingTool-creator-storyForm">
        <h4>
            {{ $t("additional:modules.tools.storyTellingTool.createStory") }}
        </h4>

        <form @submit.prevent="downloadStoryFiles">
            <div class="form-group">
                <label class="form-label">
                    {{
                        $t(
                            "additional:modules.tools.storyTellingTool.label.storyName"
                        )
                    }}
                </label>

                <input
                    v-model="storyConf.name"
                    class="form-control"
                    type="text"
                    required
                />
            </div>

            <div class="form-group">
                <label class="form-label">
                    {{
                        $t(
                            "additional:modules.tools.storyTellingTool.label.storyDescription"
                        )
                    }}
                </label>

                <textarea
                    v-model="storyConf.description"
                    class="form-control"
                />
            </div>

            <div class="form-group">
                <label class="form-label">
                    {{
                        $t(
                            "additional:modules.tools.storyTellingTool.label.author"
                        )
                    }}
                </label>

                <input
                    v-model="storyConf.author"
                    class="form-control"
                    type="text"
                />
            </div>

            <div class="form-group">
                <label class="form-label">
                    {{
                        $t(
                            "additional:modules.tools.storyTellingTool.label.steps"
                        )
                    }}
                </label>

                <v-slide-group
                    @change="
                        stepIndex =>
                            $emit('editStep', storyConf.steps[stepIndex])
                    "
                    show-arrows
                    center-active
                >
                    <v-slide-item
                        v-for="step in storyConf.steps"
                        :key="
                            getStepReference(
                                step.associatedChapter,
                                step.stepNumber
                            )
                        "
                        v-slot="{ toggle }"
                    >
                        <v-btn
                            class="story-step-button"
                            depressed
                            rounded
                            :title="step.title"
                            @click="toggle"
                        >
                            {{
                                getStepReference(
                                    step.associatedChapter,
                                    step.stepNumber
                                )
                            }}
                        </v-btn>
                    </v-slide-item>

                    <v-slide-item>
                        <v-btn
                            class="story-step-button"
                            icon
                            :title="
                                $t(
                                    'additional:modules.tools.storyTellingTool.button.addStep'
                                )
                            "
                            @click="
                                $emit(
                                    'openView',
                                    constants.storyCreationViews.STEP_CREATION
                                )
                            "
                        >
                            <v-icon>add_circle</v-icon>
                        </v-btn>
                    </v-slide-item>
                </v-slide-group>
            </div>

            <div class="tool-storyTellingTool-creator-actions">
                <button
                    type="button"
                    class="btn btn-lgv-grey"
                    :disabled="!storyConf.steps || !storyConf.steps.length"
                    @click="
                        $emit('openView', constants.storyCreationViews.PREVIEW)
                    "
                >
                    {{
                        $t(
                            "additional:modules.tools.storyTellingTool.button.previewStory"
                        )
                    }}
                </button>
                <button
                    type="submit"
                    class="btn btn-lgv-grey"
                    :disabled="!storyConf.steps || !storyConf.steps.length"
                >
                    {{
                        $t(
                            "additional:modules.tools.storyTellingTool.button.downloadStory"
                        )
                    }}
                </button>
            </div>
        </form>
    </div>
</template>

<style lang="less" scoped>
#tool-storyTellingTool-creator-storyForm {
    max-width: 460px;

    .story-step-button {
        min-width: 46px;
        height: 46px;
        padding: 0;
    }

    .tool-storyTellingTool-creator-actions {
        margin-top: 20px;
    }
}
</style>
