import state from "./stateMapMarker";
import getters from "./gettersMapMarker";
import mutations from "./mutationsMapMarker";
import actions from "./actionsMapMarker";

export default {
    namespaced: true,
    state,
    actions,
    getters,
    mutations
};
