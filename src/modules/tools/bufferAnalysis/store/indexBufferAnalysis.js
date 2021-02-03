import actions from "./actionsBufferAnalysis";
import mutations from "./mutationsBufferAnalysis";
import getters from "./gettersBufferAnalysis";
import state from "./stateBufferAnalysis";


export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
