import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import state from "./stateBufferAnalysis";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;
