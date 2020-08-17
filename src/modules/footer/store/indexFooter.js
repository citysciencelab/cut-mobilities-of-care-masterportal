import state from "./stateFooter";
import getters from "./gettersFooter";
import actions from "./actionsFooter";
import mutations from "./mutationsFooter";

export default {
    namespaced: true,
    state: {...state},
    getters,
    actions,
    mutations
};
