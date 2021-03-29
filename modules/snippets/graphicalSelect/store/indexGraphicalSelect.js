import getters from "./gettersGraphicalSelect";
import mutations from "./mutationsGraphicalSelect";
import actions from "./actionsGraphicalSelect";
import state from "./stateGraphicalSelect";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    getters,
    actions
};
