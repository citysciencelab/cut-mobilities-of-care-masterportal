
import {generateSimpleGetters} from "../../../../app-store/utils/generators";
import state from "./stateSelectFeatures";

const getters = {
    ...generateSimpleGetters(state)
};

export default getters;
