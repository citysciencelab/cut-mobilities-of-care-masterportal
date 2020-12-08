import actions from "./actionsLayerAnalysis";
import mutations from "./mutationsLayerAnalysis";
import getters from "./gettersLayerAnalysis";
import state from "./stateLayerAnalysis";


export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
