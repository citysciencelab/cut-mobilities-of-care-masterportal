import state from "./stateAlerting";
import mutations from "./mutationsAlerting";
import getters from "./gettersAlerting";
import actions from "./actionsAlerting";

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
