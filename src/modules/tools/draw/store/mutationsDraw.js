import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateDraw";

const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
