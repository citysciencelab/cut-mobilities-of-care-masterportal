import storyCreatorActions from "./actions/storyCreatorActions";
import stateStoryTellingTool from "./stateStoryTellingTool";

const initialState = JSON.parse(JSON.stringify(stateStoryTellingTool)),
    actions = {
        ...storyCreatorActions,

        /**
         * Resets the Story Telling Tool.
         *
         * @param {Object} context actions context object.
         * @returns {void}
         */
        resetModule ({commit}) {
            // Reset store data
            commit("setStoryConf", initialState.storyConf);
            commit("setHtmlContents", initialState.htmlContents);
            commit("setHtmlContentsImages", initialState.htmlContentsImages);
            commit("setInitialWidth", initialState.initialWidth);
        }
    };

export default actions;
