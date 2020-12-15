import {generateSimpleMutations} from "../../../../app-store/utils/generators";
import initialState from "./stateDownload";

const mutations = {
    ...generateSimpleMutations(initialState)
};

export default mutations;
