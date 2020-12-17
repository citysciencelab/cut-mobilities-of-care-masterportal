import getters from "./gettersMeasure";
import mutations from "./mutationsMeasure";
import actions from "./actionsMeasure";
import state from "./stateMeasure";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
