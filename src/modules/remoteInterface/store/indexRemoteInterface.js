import state from "./stateRemoteInterface";
import mutations from "./mutationsRemoteInterface";
import getters from "./gettersRemoteInterface";
import actions from "./actionsRemoteInterface";

export default {
    namespaced: true,
    state,
    actions,
    mutations,
    getters
};
