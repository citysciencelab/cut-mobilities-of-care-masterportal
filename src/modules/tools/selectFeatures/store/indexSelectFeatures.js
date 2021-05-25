import getters from "./gettersSelectFeatures";
import mutations from "./mutationsSelectFeatures";
import state from "./stateSelectFeatures";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters
};
