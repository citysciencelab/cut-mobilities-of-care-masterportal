import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateStyleVT";

const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
