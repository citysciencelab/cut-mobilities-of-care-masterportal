import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateContact";

const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
