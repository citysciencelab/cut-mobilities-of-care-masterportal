import getters from "./gettersSupplyCoord";
import mutations from "./mutationsSupplyCoord";
import actions from "./actionsSupplyCoord";
import state from "./stateSupplyCoord";

export default {
    namespaced: true,
    state: {...state},
    mutations,
    actions,
    getters
};
