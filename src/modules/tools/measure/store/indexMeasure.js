import getters from "./gettersMeasure";
import mutations from "./mutationsMeasure";
import actions from "./actionsMeasure";
import state from "./stateMeasure";
import "../utils/typedefs";

export default {
    namespaced: true,
    state,
    mutations,
    actions,
    getters
};
