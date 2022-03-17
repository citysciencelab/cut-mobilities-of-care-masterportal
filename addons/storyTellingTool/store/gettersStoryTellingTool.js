import {generateSimpleGetters} from "../../../src/app-store/utils/generators";
import storyTellingToolState from "./stateStoryTellingTool";

const getters = {
    ...generateSimpleGetters(storyTellingToolState)
};

export default getters;
